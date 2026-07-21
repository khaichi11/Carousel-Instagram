/* Prompt engine for the GPT Prompt Generator.
 * Loads master prompt templates from /prompts/*.txt and injects user inputs
 * into placeholder variables. Designed to support multiple templates without
 * changing the UI. */

const PROMPT_TEMPLATES = [
  { id: "carousel", label: "Educational Carousel", file: "prompts/carousel-master-prompt.txt" },
  { id: "utbk", label: "UTBK Carousel", file: "prompts/utbk-prompt.txt" },
  { id: "storytelling", label: "Storytelling Carousel", file: "prompts/storytelling-prompt.txt" },
  { id: "motivation", label: "Motivation Carousel", file: "prompts/motivation-prompt.txt" },
  { id: "business", label: "Business Carousel", file: "prompts/business-prompt.txt" },
  { id: "programming", label: "Programming Carousel", file: "prompts/programming-prompt.txt" },
];

const DEFAULTS = {
  topic: "",
  targetAudience: "pelajar dan pejuang UTBK",
  goal: "membuat carousel edukasi yang menarik dan mudah dipahami",
  tone: "motivasi edukatif",
  slides: "5-7",
  extraInstructions: "",
};

const PLACEHOLDERS = {
  TOPIC: "topic",
  TARGET_AUDIENCE: "targetAudience",
  GOAL: "goal",
  TONE: "tone",
  SLIDES: "slides",
  EXTRA_INSTRUCTIONS: "extraInstructions",
};

const cache = new Map();

export function listPromptTemplates() {
  return PROMPT_TEMPLATES.map((t) => ({ id: t.id, label: t.label }));
}

export async function loadTemplate(id) {
  const tpl = PROMPT_TEMPLATES.find((t) => t.id === id) || PROMPT_TEMPLATES[0];
  if (cache.has(tpl.id)) return cache.get(tpl.id);
  try {
    const res = await fetch(tpl.file);
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
    default: return "";
  }
}
