/* Prompt engine for the GPT Prompt Generator.
 * Loads master prompt templates from /prompts/*.txt and injects user inputs
 * into placeholder variables. Designed to support multiple templates without
 * changing the UI. */

/* Two families of templates:
 *  - mode "form"   → built from the quick form (topic/audience/goal/…), the original flow.
 *  - mode "editor" → built around a naskah/brainstorm the user pastes into the text
 *                    editor ({{MATERIAL}}); written in Indonesian and carrying the
 *                    brief-format rules, so ChatGPT hands back something the importer
 *                    can parse straight away. */
const PROMPT_TEMPLATES = [
  { id: "carousel", label: "Educational Carousel", file: "prompts/carousel-master-prompt.txt", mode: "form" },
  { id: "utbk", label: "UTBK Carousel", file: "prompts/utbk-prompt.txt", mode: "form" },
  { id: "storytelling", label: "Storytelling Carousel", file: "prompts/storytelling-prompt.txt", mode: "form" },
  { id: "motivation", label: "Motivation Carousel", file: "prompts/motivation-prompt.txt", mode: "form" },
  { id: "business", label: "Business Carousel", file: "prompts/business-prompt.txt", mode: "form" },
  { id: "programming", label: "Programming Carousel", file: "prompts/programming-prompt.txt", mode: "form" },
  { id: "editor-format", label: "Ubah naskah → format slide (ID)", file: "prompts/editor-format-id.txt", mode: "editor" },
  { id: "editor-kembangkan", label: "Kembangkan brainstorm → carousel (ID)", file: "prompts/editor-kembangkan-id.txt", mode: "editor" },
  { id: "editor-rapikan", label: "Rapikan & padatkan naskah (ID)", file: "prompts/editor-rapikan-id.txt", mode: "editor" },
];

const DEFAULTS = {
  topic: "",
  targetAudience: "pelajar dan pejuang UTBK",
  goal: "membuat carousel edukasi yang menarik dan mudah dipahami",
  tone: "motivasi edukatif",
  slides: "5-7",
  extraInstructions: "",
  material: "",
};

const PLACEHOLDERS = {
  TOPIC: "topic",
  TARGET_AUDIENCE: "targetAudience",
  GOAL: "goal",
  TONE: "tone",
  SLIDES: "slides",
  EXTRA_INSTRUCTIONS: "extraInstructions",
  MATERIAL: "material",
};

const cache = new Map();

// `mode` defaults to "form" so the original call site keeps getting exactly the
// templates it always got, unaffected by the editor ones added above.
export function listPromptTemplates(mode) {
  const want = mode || "form";
  return PROMPT_TEMPLATES.filter((t) => (t.mode || "form") === want).map((t) => ({ id: t.id, label: t.label }));
}

export async function loadTemplate(id) {
  const tpl = PROMPT_TEMPLATES.find((t) => t.id === id) || PROMPT_TEMPLATES[0];
  if (cache.has(tpl.id)) return cache.get(tpl.id);
  try {
    // Cache-bust so template edits actually reach returning users (the .txt files are
    // otherwise fetched without a version and can be served stale from browser cache).
    const res = await fetch(tpl.file + "?v=4");
    if (!res.ok) throw new Error("Failed to load " + tpl.file);
    const text = await res.text();
    cache.set(tpl.id, text);
    return text;
  } catch (e) {
    console.warn("Prompt template load failed:", e);
    return "";
  }
}

export function generatePrompt(templateText, inputs) {
  const data = Object.assign({}, DEFAULTS, inputs);
  let out = templateText;
  Object.entries(PLACEHOLDERS).forEach(([placeholder, key]) => {
    const value = String(data[key] || "").trim();
    const safeValue = value || defaultFor(key);
    const regex = new RegExp("\\{\\{" + placeholder + "\\}\\}", "g");
    out = out.replace(regex, safeValue);
  });
  return out.trim();
}

function defaultFor(key) {
  switch (key) {
    case "topic": return "[tulis topik di sini]";
    case "targetAudience": return "pelajar Indonesia";
    case "goal": return "membuat konten edukasi yang bermanfaat";
    case "tone": return "motivasi edukatif";
    case "slides": return "5-7";
    case "extraInstructions": return "Tidak ada instruksi tambahan.";
    case "material": return "[tempel naskah / hasil brainstorming di sini]";
    default: return "";
  }
}
