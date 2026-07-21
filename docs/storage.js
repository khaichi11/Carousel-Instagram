/* Offline project storage (IndexedDB) — no backend, no account.
 *
 * Three stores keep the project list instant and the data deduplicated:
 *   meta    — one small row per project: {id, kind: "saved"|"auto", name, of,
 *             createdAt, updatedAt, autosavedAt, thumb, appVersion}. Listing the
 *             projects never loads the heavy content.
 *   content — the full project state per id. Every large data-URL (uploads, meme
 *             images, backgrounds, generated PNGs) is swapped for {__a: <sha256>}.
 *   assets  — data-URLs keyed by their sha-256, stored ONCE no matter how many
 *             projects/autosaves reference them.
 *
 * Autosaves (kind "auto") are recovery files capped at MAX_AUTO rows — oldest is
 * dropped automatically. Saved projects (kind "saved") are permanent. sweepAssets()
 * deletes asset rows no content row references anymore.
 */
const DB_NAME = "carousel-studio";
const DB_VER = 1;
export const MAX_AUTO = 3;

let dbPromise = null;
function open() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((res, rej) => {
    const q = indexedDB.open(DB_NAME, DB_VER);
    q.onupgradeneeded = () => {
      const db = q.result;
      if (!db.objectStoreNames.contains("meta")) db.createObjectStore("meta", { keyPath: "id" });
      if (!db.objectStoreNames.contains("content")) db.createObjectStore("content", { keyPath: "id" });
      if (!db.objectStoreNames.contains("assets")) db.createObjectStore("assets", { keyPath: "hash" });
    };
    q.onsuccess = () => {
      const db = q.result;
      // The connection can go bad after we've cached it — another tab clearing site
      // data, the browser evicting storage under pressure, etc. Without this, every
      // autosave after that point would silently fail forever (dbPromise still points
      // at the dead connection, so open() keeps handing it out). Dropping the cache
      // here means the next call transparently opens a fresh connection instead.
      db.onversionchange = () => { db.close(); dbPromise = null; };
      db.onclose = () => { dbPromise = null; };
      res(db);
    };
    q.onerror = () => { dbPromise = null; rej(q.error); };
  });
  return dbPromise;
}
async function tx(stores, mode, fn, _retried) {
  const db = await open();
  try {
    return await new Promise((res, rej) => {
      const t = db.transaction(stores, mode);
      const out = fn.length > 1 ? fn(...stores.map((s) => t.objectStore(s))) : fn(t.objectStore(stores[0]));
      t.oncomplete = () => res(out && out.__req ? out.__req.result : out);
      t.onerror = () => rej(t.error);
      t.onabort = () => rej(t.error);
    });
  } catch (e) {
    // A connection that goes bad after we've cached it (browser storage eviction,
    // another tab clearing site data, an unexpected close) makes db.transaction()
    // throw and every future call would keep hitting the same dead connection —
    // silently breaking autosave for the rest of the session. Transactions are
    // atomic (a failed one never partially wrote), so it's safe to drop the cached
    // connection and retry once with a fresh one before giving up.
    if (!_retried) { dbPromise = null; return tx(stores, mode, fn, true); }
    throw e;
  }
}
function reqAll(store, method, arg) {
  const r = arg === undefined ? store[method]() : store[method](arg);
  return { __req: r };
}

/* ---- asset interning ---- */
const hashCache = new Map(); // dataURL string -> hash (strings are shared refs; no extra copies)
async function sha256(str) {
  if (hashCache.has(str)) return hashCache.get(str);
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  const hex = [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  hashCache.set(str, hex);
  return hex;
}
const isBigData = (v) => typeof v === "string" && v.startsWith("data:") && v.length > 2048;

/* Deep-walk `value`; replace big data-URLs with {__a: hash} and collect them. */
async function intern(value, found) {
  if (isBigData(value)) {
    const hash = await sha256(value);
    found.set(hash, value);
    return { __a: hash };
  }
  if (Array.isArray(value)) {
    const out = [];
    for (const v of value) out.push(await intern(v, found));
    return out;
  }
  if (value && typeof value === "object") {
    const out = {};
    for (const k of Object.keys(value)) out[k] = await intern(value[k], found);
    return out;
  }
  return value;
}
function collectRefs(value, set) {
  if (Array.isArray(value)) value.forEach((v) => collectRefs(v, set));
  else if (value && typeof value === "object") {
    if (typeof value.__a === "string") set.add(value.__a);
    else Object.keys(value).forEach((k) => collectRefs(value[k], set));
  }
}
async function resolve(value, getAsset) {
  if (Array.isArray(value)) {
    const out = [];
    for (const v of value) out.push(await resolve(v, getAsset));
    return out;
  }
  if (value && typeof value === "object") {
    if (typeof value.__a === "string") return (await getAsset(value.__a)) || null;
    const out = {};
    for (const k of Object.keys(value)) out[k] = await resolve(value[k], getAsset);
    return out;
  }
  return value;
}

/* ---- public API ---- */
export async function saveProject(meta, content) {
  const found = new Map();
  const interned = await intern(content, found);
  await tx(["meta", "content", "assets"], "readwrite", (m, c, a) => {
    m.put(meta);
    c.put({ id: meta.id, data: interned });
    found.forEach((data, hash) => a.put({ hash, data }));
  });
  if (meta.kind === "auto") await capAutosaves();
}

export async function loadProject(id) {
  const meta = await tx(["meta"], "readonly", (m) => reqAll(m, "get", id));
  const row = await tx(["content"], "readonly", (c) => reqAll(c, "get", id));
  if (!meta || !row) return null;
  const db = await open();
  const getAsset = (hash) => new Promise((res) => {
    const r = db.transaction("assets").objectStore("assets").get(hash);
    r.onsuccess = () => res(r.result ? r.result.data : null);
    r.onerror = () => res(null);
  });
  return { meta, content: await resolve(row.data, getAsset) };
}

export async function listMeta() {
  const rows = (await tx(["meta"], "readonly", (m) => reqAll(m, "getAll"))) || [];
  return rows.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

export async function updateMeta(id, patch) {
  const meta = await tx(["meta"], "readonly", (m) => reqAll(m, "get", id));
  if (!meta) return;
  await tx(["meta"], "readwrite", (m) => m.put(Object.assign(meta, patch)));
}

export async function deleteProject(id) {
  await tx(["meta", "content"], "readwrite", (m, c) => { m.delete(id); c.delete(id); });
}

async function capAutosaves() {
  const autos = (await listMeta()).filter((m) => m.kind === "auto");
  for (const m of autos.slice(MAX_AUTO)) await deleteProject(m.id);
}

/* Delete asset rows no content row references. Cheap enough to run after deletes. */
export async function sweepAssets() {
  const rows = (await tx(["content"], "readonly", (c) => reqAll(c, "getAll"))) || [];
  const used = new Set();
  rows.forEach((r) => collectRefs(r.data, used));
  const hashes = (await tx(["assets"], "readonly", (a) => reqAll(a, "getAllKeys"))) || [];
  const orphans = hashes.filter((h) => !used.has(h));
  if (orphans.length) await tx(["assets"], "readwrite", (a) => orphans.forEach((h) => a.delete(h)));
  return orphans.length;
}

export async function storageEstimate() {
  try {
    if (navigator.storage && navigator.storage.estimate) return await navigator.storage.estimate();
  } catch (e) { /* unsupported */ }
  return null;
}

/* Project file export/import (assets inlined so the file is portable). */
export async function exportProject(id) {
  const proj = await loadProject(id);
  if (!proj) return null;
  return { app: "carousel-studio", version: 1, meta: proj.meta, content: proj.content };
}
export async function importProject(json, newId) {
  if (!json || !json.content) throw new Error("File project tidak valid.");
  const meta = Object.assign({}, json.meta || {}, {
    id: newId, kind: "saved",
    name: (json.meta && json.meta.name ? json.meta.name : "Import") + "",
    createdAt: Date.now(), updatedAt: Date.now(),
  });
  await saveProject(meta, json.content);
  return meta;
}

export const newId = (prefix) => (prefix || "p") + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
