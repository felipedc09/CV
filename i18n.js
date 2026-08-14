const sourceEnglish = window.CV_CONTENT_EN || {};
const sourceSpanish = window.CV_CONTENT_ES || {};

const PHRASE_PAIRS_EN_ES = [
  ["Senior Software Engineer", "Ingeniero de Software Senior"],
  ["Software Architect", "Arquitecto de Software"],
  ["Full Stack Developer", "Desarrollador Full Stack"],
  ["Systems Engineer", "Ingeniero de Sistemas"],
  ["Profile", "Perfil"],
  ["Experience", "Experiencia"],
  ["Technical Skills", "Habilidades Tecnicas"],
  ["Soft Skills", "Habilidades Blandas"],
  ["Career Objective", "Objetivo Profesional"],
  ["Education", "Educacion"],
  ["University Education", "Educacion Universitaria"],
  ["Complementary Training", "Formacion Complementaria"],
  ["Conferences", "Conferencias"],
  ["Contact", "Contacto"],
  ["Phone", "Telefono"],
  ["Email", "Correo"],
  ["Address", "Direccion"],
  ["Languages", "Idiomas"],
  ["Spanish", "Espanol"],
  ["English", "Ingles"],
  ["French", "Frances"],
  ["Native", "Nativo"],
  ["Basic", "Basico"],
  ["Advanced", "Avanzado"],
  ["Intermediate", "Intermedio"],
  ["Programming", "Programacion"],
  ["Frameworks / Tools", "Frameworks / Herramientas"],
  ["Databases", "Bases de Datos"],
  ["Construction Technology Sector", "Sector de Tecnologia para Construccion"],
  ["Innovation Engineering", "Ingenieria de Innovacion"]
];

const WORD_PAIRS_EN_ES = [
  ["with", "con"], ["and", "y"], ["for", "para"], ["to", "a"], ["of", "de"], ["in", "en"],
  ["building", "construyendo"], ["products", "productos"], ["robust", "robustos"],
  ["scalable", "escalables"], ["maintainable", "mantenibles"], ["complex", "complejos"],
  ["architecture", "arquitectura"], ["frontend", "frontend"], ["backend", "backend"],
  ["cloud", "nube"], ["design", "diseno"], ["team", "equipo"], ["lead", "lider"],
  ["leadership", "liderazgo"], ["delivery", "entrega"], ["project", "proyecto"],
  ["testing", "pruebas"], ["containers", "contenedores"], ["toward", "hacia"]
];

let currentLang = localStorage.getItem("cvLang") || "en";

function t(key) {
  return (translations[currentLang] && translations[currentLang][key]) || key;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceCaseInsensitive(input, findText, replaceText) {
  if (!findText) {
    return input;
  }
  return input.replace(new RegExp(escapeRegex(findText), "gi"), replaceText);
}

function fallbackTranslateEnglishToSpanish(value) {
  const raw = String(value || "");
  const parts = raw.split(/(<[^>]+>)/g);

  return parts.map((part) => {
    if (part.startsWith("<") && part.endsWith(">")) {
      return part;
    }

    let text = part;
    PHRASE_PAIRS_EN_ES.forEach(([enText, esText]) => {
      text = replaceCaseInsensitive(text, enText, esText);
    });

    WORD_PAIRS_EN_ES.forEach(([enWord, esWord]) => {
      const pattern = new RegExp(`\\b${escapeRegex(enWord)}\\b`, "gi");
      text = text.replace(pattern, esWord);
    });

    return text;
  }).join("");
}

function buildFallbackSpanish() {
  const spanish = {};
  Object.keys(sourceEnglish).forEach((key) => {
    const value = sourceEnglish[key];
    spanish[key] = typeof value === "string"
      ? fallbackTranslateEnglishToSpanish(value)
      : value;
  });
  return spanish;
}

// Render the sidebar skill chips from the canonical skills data in en.js.
// Programming = languages; Frameworks / Tools = frameworks + cloud + testing + tools;
// Databases = databases. `short` gives a compact chip label; `l` sets the level dot.
function renderSkillChips(skills) {
  if (!skills) {
    return;
  }
  const chip = (s) =>
    `<li class="skill-item"><span class="dot-${s.l === "a" ? "a" : "i"}">●</span> ${s.short || s.n}</li>`;
  const groups = {
    skillListLanguages: skills.languages || [],
    skillListFrameworks: []
      .concat(skills.frameworks || [], skills.cloud || [], skills.testing || [], skills.tools || []),
    skillListDatabases: skills.databases || []
  };
  Object.keys(groups).forEach((id) => {
    const ul = document.getElementById(id);
    if (ul) {
      ul.innerHTML = groups[id].map(chip).join("");
    }
  });
}

const translations = {
  en: sourceEnglish,
  es: Object.keys(sourceSpanish).length > 0 ? sourceSpanish : buildFallbackSpanish()
};

function updateContent() {
  document.documentElement.lang = currentLang;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.getAttribute("data-i18n");
    const translation = translations[currentLang][key];
    if (translation) {
      element.innerHTML = translation;
    }
  });

  document.querySelectorAll("[data-i18n-href]").forEach((element) => {
    const key = element.getAttribute("data-i18n-href");
    const href = translations[currentLang][key];
    if (href) {
      element.setAttribute("href", href);
    }
  });

  const fullName = translations[currentLang].fullName;
  if (fullName) {
    document.title = `CV - ${fullName}`;
  }

  renderSkillChips(translations[currentLang].skills);

  const langBtn = document.getElementById("langToggle");
  if (langBtn) {
    langBtn.textContent = currentLang === "en" ? "ES" : "EN";
    langBtn.title = currentLang === "en" ? "Cambiar a Espanol" : "Switch to English";
  }

  if (window.ATSFeature) {
    window.ATSFeature.onLanguageChange();
  }

  if (typeof window.updateWebColumnFlow === "function") {
    window.updateWebColumnFlow();
    window.requestAnimationFrame(window.updateWebColumnFlow);
  }
}

function toggleLanguage() {
  currentLang = currentLang === "en" ? "es" : "en";
  localStorage.setItem("cvLang", currentLang);
  updateContent();
}

window.toggleLanguage = toggleLanguage;

document.addEventListener("DOMContentLoaded", () => {
  const langBtn = document.getElementById("langToggle");
  if (langBtn) {
    langBtn.addEventListener("click", toggleLanguage);
  }

  if (window.ATSFeature) {
    window.ATSFeature.init({
      getCurrentLang: () => currentLang,
      getTranslations: () => translations,
      getAtsButtonText: () => t("atsButton")
    });
    window.ATSFeature.renderATSView();
  }

  updateContent();
});
