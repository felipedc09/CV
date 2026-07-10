(function (root) {
  const state = {
    isATSMode: false,
    getCurrentLang: () => "en",
    getTranslations: () => ({ en: {}, es: {} }),
    getAtsButtonText: () => "ATS"
  };

  function cleanText(value) {
    return String(value || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function getAtsLocale(lang) {
    if (lang === "es") {
      return {
        roleLine: "Ingeniero de Software Senior | Arquitecto de Software | Desarrollador Full Stack",
        sectionSummary: "Resumen Profesional",
        sectionSkills: "Habilidades Tecnicas",
        sectionExperience: "Experiencia Profesional",
        sectionEducation: "Educacion",
        sectionConferences: "Conferencias y Formacion",
        sectionLanguages: "Idiomas",
        sectionCompetencies: "Competencias Clave",
        labels: {
          languages: "Lenguajes",
          frameworks: "Frameworks y Librerias",
          cloud: "Nube y DevOps",
          databases: "Bases de Datos",
          testing: "Testing",
          tools: "Herramientas y Practicas"
        },
        downloadLabel: "Descargar ATS TXT"
      };
    }

    return {
      roleLine: "Senior Software Engineer | Software Architect | Full Stack Developer",
      sectionSummary: "Professional Summary",
      sectionSkills: "Technical Skills",
      sectionExperience: "Professional Experience",
      sectionEducation: "Education",
      sectionConferences: "Conferences & Training",
      sectionLanguages: "Languages",
      sectionCompetencies: "Core Competencies",
      labels: {
        languages: "Languages",
        frameworks: "Frameworks & Libraries",
        cloud: "Cloud & DevOps",
        databases: "Databases",
        testing: "Testing",
        tools: "Tools & Practices"
      },
      downloadLabel: "Download ATS TXT"
    };
  }

  function getAtsStructuredContent(lang) {
    const translations = state.getTranslations();
    const content = translations[lang] || translations.en || {};
    const locale = getAtsLocale(lang);

    return {
      name: "Felipe Duitama",
      roleLine: locale.roleLine,
      contactLine: "Bogota, Colombia | +57 320 3448583 | felipedc09@gmail.com | github.com/felipedc09 | linkedin.com/in/felipedc09",
      companyHeader: `${cleanText(content.companyName)} - Bogota, Colombia`,
      companyRoleLine: lang === "es"
        ? "Lider Tecnico / Ingeniero de Software Senior (evolucion desde Frontend Engineer) | 2015 - 2026"
        : "Technical Lead / Senior Software Engineer (progressed from Frontend Engineer) | 2015 - 2026",
      companySummary: cleanText(content.companySummary),
      summary: [cleanText(content.profileText1), cleanText(content.profileText2), cleanText(content.profileText3)],
      technicalSkills: {
        languages: "C#, JavaScript, TypeScript, Python, HTML, CSS",
        frameworks: "React, Next.js, Node.js, .NET, Unity 3D",
        cloud: "AWS (ECS, Fargate, EC2, Lambda, API Gateway, CloudWatch), Docker, Kubernetes, GitHub Actions, CI/CD",
        databases: "MongoDB, MySQL, PostgreSQL",
        testing: "Playwright, Cypress",
        tools: "Git, GitHub Copilot, Clean Architecture, Atomic Design, Conventional Commits, Semantic Versioning"
      },
      experienceSections: [
        { title: cleanText(content.vEyeTitle), items: [cleanText(content.vEye1), cleanText(content.vEye2), cleanText(content.vEye3)] },
        { title: cleanText(content.resourceTitle), items: [cleanText(content.resource1)] },
        { title: cleanText(content.hololensTitle), items: [cleanText(content.hololens1)] },
        { title: cleanText(content.arasTitle), items: [cleanText(content.aras1), cleanText(content.aras2), cleanText(content.aras3), cleanText(content.aras4), cleanText(content.aras5), cleanText(content.aras6), cleanText(content.aras7)] },
        { title: cleanText(content.takeoffTitle), items: [cleanText(content.takeoff1), cleanText(content.takeoff2)] },
        { title: cleanText(content.catalogueTitle), items: [cleanText(content.catalogue1)] },
        { title: cleanText(content.viewerTitle), items: [cleanText(content.viewer1), cleanText(content.viewer2)] }
      ],
      education: [
        { institution: cleanText(content.universityName), details: `${cleanText(content.systemsEngineering)} | 2011 - 2020` },
        { institution: "UNAD Naska Digital", details: `${cleanText(content.unityCertified)} | 2017 - 2019` }
      ],
      conferences: ["JSConf, NodeConf, Unity Developer Day - 2019", "CSSConf Colombia - 2021"],
      languages: [
        `${cleanText(content.spanish)} (${cleanText(content.native)})`,
        `${cleanText(content.english)} (${cleanText(content.englishLevel)})`,
        `${cleanText(content.french)} (${cleanText(content.basic)})`
      ],
      coreCompetencies: [cleanText(content.skill1), cleanText(content.skill2), cleanText(content.skill3), cleanText(content.skill4), cleanText(content.skill5), cleanText(content.skill6)],
      locale
    };
  }

  function renderATSView() {
    const rootEl = document.getElementById("atsView");
    if (!rootEl) {
      return;
    }

    const lang = state.getCurrentLang();
    const data = getAtsStructuredContent(lang);
    const sectionMarkup = data.experienceSections
      .map((section) => `<p class="ats-subtitle">${section.title}</p><ul class="ats-bullets">${section.items.map((item) => `<li>${item}</li>`).join("")}</ul>`)
      .join("");

    rootEl.innerHTML = `
      <div class="ats-header">
        <h1>${data.name}</h1>
        <p>${data.roleLine}</p>
        <p>${data.contactLine}</p>
      </div>
      <hr class="ats-divider" />

      <section class="ats-section">
        <h2>${data.locale.sectionSummary}</h2>
        ${data.summary.map((item) => `<p>${item}</p>`).join("")}
      </section>

      <section class="ats-section">
        <h2>${data.locale.sectionSkills}</h2>
        <p><strong>${data.locale.labels.languages}:</strong> ${data.technicalSkills.languages}</p>
        <p><strong>${data.locale.labels.frameworks}:</strong> ${data.technicalSkills.frameworks}</p>
        <p><strong>${data.locale.labels.cloud}:</strong> ${data.technicalSkills.cloud}</p>
        <p><strong>${data.locale.labels.databases}:</strong> ${data.technicalSkills.databases}</p>
        <p><strong>${data.locale.labels.testing}:</strong> ${data.technicalSkills.testing}</p>
        <p><strong>${data.locale.labels.tools}:</strong> ${data.technicalSkills.tools}</p>
      </section>

      <section class="ats-section">
        <h2>${data.locale.sectionExperience}</h2>
        <p class="ats-subtitle">${data.companyHeader}</p>
        <p>${data.companyRoleLine}</p>
        <p>${data.companySummary}</p>
        ${sectionMarkup}
      </section>

      <section class="ats-section">
        <h2>${data.locale.sectionEducation}</h2>
        ${data.education.map((item) => `<p><strong>${item.institution}</strong><br>${item.details}</p>`).join("")}
      </section>

      <section class="ats-section">
        <h2>${data.locale.sectionConferences}</h2>
        <ul class="ats-bullets">${data.conferences.map((item) => `<li>${item}</li>`).join("")}</ul>
      </section>

      <section class="ats-section">
        <h2>${data.locale.sectionLanguages}</h2>
        <p>${data.languages.join(" | ")}</p>
      </section>

      <section class="ats-section">
        <h2>${data.locale.sectionCompetencies}</h2>
        <p>${data.coreCompetencies.join(", ")}</p>
      </section>
    `;
  }

  function buildInlineATSContent(lang) {
    const data = getAtsStructuredContent(lang);
    const lines = [];

    lines.push(data.name.toUpperCase());
    lines.push(data.roleLine);
    lines.push(data.contactLine);
    lines.push("");

    lines.push(data.locale.sectionSummary.toUpperCase());
    data.summary.forEach((item) => lines.push(`- ${item}`));
    lines.push("");

    lines.push(data.locale.sectionExperience.toUpperCase());
    lines.push(`- ${data.companyHeader}`);
    lines.push(`- ${data.companyRoleLine}`);
    lines.push(`- ${data.companySummary}`);
    lines.push("");

    data.experienceSections.forEach((section) => {
      lines.push(section.title.toUpperCase());
      section.items.forEach((item) => lines.push(`- ${item}`));
      lines.push("");
    });

    lines.push(data.locale.sectionSkills.toUpperCase());
    lines.push(`- ${data.locale.labels.languages}: ${data.technicalSkills.languages}`);
    lines.push(`- ${data.locale.labels.frameworks}: ${data.technicalSkills.frameworks}`);
    lines.push(`- ${data.locale.labels.cloud}: ${data.technicalSkills.cloud}`);
    lines.push(`- ${data.locale.labels.databases}: ${data.technicalSkills.databases}`);
    lines.push(`- ${data.locale.labels.testing}: ${data.technicalSkills.testing}`);
    lines.push(`- ${data.locale.labels.tools}: ${data.technicalSkills.tools}`);
    lines.push("");

    lines.push(data.locale.sectionEducation.toUpperCase());
    data.education.forEach((item) => {
      lines.push(`- ${item.institution} | ${item.details}`);
    });
    lines.push("");

    lines.push(data.locale.sectionConferences.toUpperCase());
    data.conferences.forEach((item) => lines.push(`- ${item}`));
    lines.push("");

    lines.push(data.locale.sectionLanguages.toUpperCase());
    lines.push(`- ${data.languages.join(" | ")}`);
    lines.push("");

    lines.push(data.locale.sectionCompetencies.toUpperCase());
    lines.push(`- ${data.coreCompetencies.join(", ")}`);
    lines.push("");

    return lines.join("\n").trim() + "\n";
  }

  async function loadGeneratedATSContent(lang) {
    const fileName = lang === "es" ? "content/ats.es.txt" : "content/ats.en.txt";
    const response = await fetch(`${fileName}?v=${Date.now()}`);
    if (!response.ok) {
      throw new Error("Unable to load generated ATS content");
    }
    return response.text();
  }

  async function downloadATSVersion() {
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const lang = state.getCurrentLang();
    const suffix = lang.toUpperCase();
    let content = "";

    try {
      content = await loadGeneratedATSContent(lang);
    } catch (error) {
      content = buildInlineATSContent(lang);
    }

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Felipe_Duitama_CV_ATS_${suffix}_${date}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  function updateATSButtonLabel() {
    const atsBtn = document.getElementById("downloadATS");
    if (!atsBtn) {
      return;
    }

    atsBtn.textContent = state.isATSMode ? "CV" : state.getAtsButtonText();
    atsBtn.title = state.isATSMode ? "Back to designed CV view" : "Open ATS view";
  }

  function toggleATSMode() {
    state.isATSMode = !state.isATSMode;
    document.body.classList.toggle("ats-mode", state.isATSMode);

    if (state.isATSMode) {
      renderATSView();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    updateATSButtonLabel();
  }

  function onLanguageChange() {
    if (state.isATSMode) {
      renderATSView();
    }
    updateATSButtonLabel();
  }

  function init(options) {
    state.getCurrentLang = options.getCurrentLang;
    state.getTranslations = options.getTranslations;
    state.getAtsButtonText = options.getAtsButtonText;
    onLanguageChange();
  }

  root.ATSFeature = {
    init,
    onLanguageChange,
    toggleATSMode,
    renderATSView,
    downloadATSVersion
  };

  root.toggleATSMode = toggleATSMode;
  root.downloadATSVersion = downloadATSVersion;
})(typeof globalThis !== "undefined" ? globalThis : this);
