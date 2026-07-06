const sourceEnglish = window.CV_CONTENT_EN || {};
const sourceSpanish = window.CV_CONTENT_ES || {};

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
  const phrasePairs = [
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

  const wordPairs = [
    ["with", "con"], ["and", "y"], ["for", "para"], ["to", "a"], ["of", "de"], ["in", "en"],
    ["building", "construyendo"], ["products", "productos"], ["robust", "robustos"],
    ["scalable", "escalables"], ["maintainable", "mantenibles"], ["complex", "complejos"],
    ["architecture", "arquitectura"], ["frontend", "frontend"], ["backend", "backend"],
    ["cloud", "nube"], ["design", "diseno"], ["team", "equipo"], ["lead", "lider"],
    ["leadership", "liderazgo"], ["delivery", "entrega"], ["project", "proyecto"],
    ["testing", "pruebas"], ["containers", "contenedores"], ["toward", "hacia"]
  ];

  return parts.map((part) => {
    if (part.startsWith("<") && part.endsWith(">")) {
      return part;
    }

    let text = part;
    phrasePairs.forEach(([enText, esText]) => {
      text = replaceCaseInsensitive(text, enText, esText);
    });

    wordPairs.forEach(([enWord, esWord]) => {
      const pattern = new RegExp(`\\b${escapeRegex(enWord)}\\b`, "gi");
      text = text.replace(pattern, esWord);
    });

    return text;
  }).join("");
}

function buildFallbackSpanish() {
  const spanish = {};
  Object.keys(sourceEnglish).forEach((key) => {
    spanish[key] = fallbackTranslateEnglishToSpanish(sourceEnglish[key]);
  });
  return spanish;
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
