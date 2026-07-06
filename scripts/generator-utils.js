const fs = require("fs");

function cleanText(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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

function translateEnglishToSpanishText(value) {
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

  const translated = parts.map((part) => {
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
  });

  return translated.join("");
}

function generateSpanishFromEnglish(englishContent) {
  const spanish = {};
  Object.keys(englishContent).forEach((key) => {
    spanish[key] = translateEnglishToSpanishText(englishContent[key]);
  });
  return spanish;
}

function extractAtsKeywords(sourceText) {
  const keywordPool = [
    "Software Architecture", "Principal Software Engineer", "Full Stack", "React", "Next.js",
    "TypeScript", "JavaScript", "Node.js", "C#", ".NET", "Python", "AWS", "ECS Fargate",
    "Lambda", "API Gateway", "CloudWatch", "Microservices", "Kubernetes", "Docker",
    "CI/CD", "GitHub Actions", "PostgreSQL", "MongoDB", "Mapbox", "WebGL", "Unity 3D",
    "Revit", "Digital Twin", "Dijkstra", "WebSocket", "Technical Leadership"
  ];

  const normalizedSource = sourceText.toLowerCase();
  return keywordPool.filter((keyword) => normalizedSource.includes(keyword.toLowerCase()));
}

function addSection(lines, title, items) {
  const validItems = items.filter(Boolean);
  if (validItems.length === 0) {
    return;
  }

  lines.push(title);
  validItems.forEach((item) => {
    lines.push(`- ${item}`);
  });
  lines.push("");
}

function getAtsLocale(lang) {
  return lang === "es"
    ? {
      roleLine: "Ingeniero de Software Senior | Arquitecto de Software | Desarrollador Full Stack",
      contactLine: "Bogota, Colombia | +57 320 3448583 | felipedc09@gmail.com | github.com/felipedc09 | linkedin.com/in/felipedc09",
      companyRoleLine: "Lider Tecnico / Ingeniero de Software Senior (evolucion desde Frontend Engineer) | 2015 - 2026",
      sectionSummary: "RESUMEN PROFESIONAL",
      sectionSkills: "HABILIDADES TECNICAS",
      sectionExperience: "EXPERIENCIA PROFESIONAL",
      sectionEducation: "EDUCACION",
      sectionConferences: "CONFERENCIAS Y FORMACION",
      sectionLanguages: "IDIOMAS",
      sectionCompetencies: "COMPETENCIAS CLAVE",
      sectionKeywords: "PALABRAS CLAVE ATS",
      labels: {
        languages: "Lenguajes",
        frameworks: "Frameworks y Librerias",
        cloud: "Nube y DevOps",
        databases: "Bases de Datos",
        testing: "Testing",
        tools: "Herramientas y Practicas"
      }
    }
    : {
      roleLine: "Senior Software Engineer | Software Architect | Full Stack Developer",
      contactLine: "Bogota, Colombia | +57 320 3448583 | felipedc09@gmail.com | github.com/felipedc09 | linkedin.com/in/felipedc09",
      companyRoleLine: "Technical Lead / Senior Software Engineer (progressed from Frontend Engineer) | 2015 - 2026",
      sectionSummary: "PROFESSIONAL SUMMARY",
      sectionSkills: "TECHNICAL SKILLS",
      sectionExperience: "PROFESSIONAL EXPERIENCE",
      sectionEducation: "EDUCATION",
      sectionConferences: "CONFERENCES & TRAINING",
      sectionLanguages: "LANGUAGES",
      sectionCompetencies: "CORE COMPETENCIES",
      sectionKeywords: "ATS KEYWORDS",
      labels: {
        languages: "Languages",
        frameworks: "Frameworks & Libraries",
        cloud: "Cloud & DevOps",
        databases: "Databases",
        testing: "Testing",
        tools: "Tools & Practices"
      }
    };
}

function buildATSContent(translations, lang) {
  const content = translations[lang];
  const locale = getAtsLocale(lang);

  const summary = [
    cleanText(content.profileText1),
    cleanText(content.profileText2),
    cleanText(content.profileText3)
  ];

  const experienceSections = [
    [cleanText(content.vEyeTitle), [cleanText(content.vEye1), cleanText(content.vEye2), cleanText(content.vEye3)]],
    [cleanText(content.resourceTitle), [cleanText(content.resource1)]],
    [cleanText(content.hololensTitle), [cleanText(content.hololens1)]],
    [cleanText(content.arasTitle), [cleanText(content.aras1), cleanText(content.aras2), cleanText(content.aras3), cleanText(content.aras4), cleanText(content.aras5), cleanText(content.aras6), cleanText(content.aras7)]],
    [cleanText(content.takeoffTitle), [cleanText(content.takeoff1), cleanText(content.takeoff2)]],
    [cleanText(content.catalogueTitle), [cleanText(content.catalogue1)]],
    [cleanText(content.viewerTitle), [cleanText(content.viewer1), cleanText(content.viewer2)]]
  ];

  const lines = [];
  lines.push("FELIPE DUITAMA");
  lines.push(locale.roleLine);
  lines.push(locale.contactLine);
  lines.push("");

  addSection(lines, locale.sectionSummary, summary);
  addSection(lines, locale.sectionExperience, [
    `${cleanText(content.companyName)} - Bogota, Colombia`,
    locale.companyRoleLine,
    cleanText(content.companySummary)
  ]);

  experienceSections.forEach(([title, items]) => {
    addSection(lines, title.toUpperCase(), items);
  });

  addSection(lines, locale.sectionSkills, [
    `${locale.labels.languages}: C#, JavaScript, TypeScript, Python, HTML, CSS`,
    `${locale.labels.frameworks}: React, Next.js, Node.js, .NET, Unity 3D`,
    `${locale.labels.cloud}: AWS (ECS, Fargate, EC2, Lambda, API Gateway, CloudWatch), Docker, Kubernetes, GitHub Actions, CI/CD`,
    `${locale.labels.databases}: MongoDB, MySQL, PostgreSQL`,
    `${locale.labels.testing}: Playwright, Cypress`,
    `${locale.labels.tools}: Git, GitHub Copilot, Clean Architecture, Atomic Design, Conventional Commits, Semantic Versioning`
  ]);

  addSection(lines, locale.sectionEducation, [
    `${cleanText(content.universityName)} | ${cleanText(content.systemsEngineering)} | 2011 - 2020`,
    `UNAD Naska Digital | ${cleanText(content.unityCertified)} | 2017 - 2019`
  ]);

  addSection(lines, locale.sectionConferences, [
    "JSConf, NodeConf, Unity Developer Day - 2019",
    "CSSConf Colombia - 2021"
  ]);

  addSection(lines, locale.sectionLanguages, [
    `${cleanText(content.spanish)} (${cleanText(content.native)}) | ${cleanText(content.english)} (${cleanText(content.englishLevel)}) | ${cleanText(content.french)} (${cleanText(content.basic)})`
  ]);

  addSection(lines, locale.sectionCompetencies, [
    [cleanText(content.skill1), cleanText(content.skill2), cleanText(content.skill3), cleanText(content.skill4), cleanText(content.skill5), cleanText(content.skill6)].join(", ")
  ]);

  const sourceForKeywords = lines.join(" ");
  const keywords = extractAtsKeywords(sourceForKeywords);
  addSection(lines, locale.sectionKeywords, [keywords.join(", ")]);

  return lines.join("\n").trim() + "\n";
}

function writeUMDContentFile(filePath, globalName, contentObject, banner) {
  const lines = [];
  if (banner) {
    lines.push(`// ${banner}`);
  }
  lines.push("(function (root, factory) {");
  lines.push("  const data = factory();");
  lines.push("  if (typeof module === \"object\" && module.exports) {");
  lines.push("    module.exports = data;");
  lines.push("  }");
  lines.push(`  root.${globalName} = data;`);
  lines.push("})(typeof globalThis !== \"undefined\" ? globalThis : this, function () {");
  lines.push(`  return ${JSON.stringify(contentObject, null, 2)};`);
  lines.push("});");
  lines.push("");

  fs.writeFileSync(filePath, lines.join("\n"), "utf8");
}

module.exports = {
  cleanText,
  generateSpanishFromEnglish,
  buildATSContent,
  writeUMDContentFile
};
