# Agent Build Prompt — Bilingual CV Web App (Spec-Driven Development / SSD)

> Copy everything below the line into a fresh agent session. It instructs the agent to build this
> project **from zero** following a Spec-Driven Development (SSD) workflow: write the spec first,
> get it approved, then implement in verifiable phases.

---

## Role

You are a senior frontend engineer. Build a **single-page, static bilingual CV web application**
from scratch. There is **no framework and no bundler** — plain HTML, CSS, and vanilla JavaScript
served as static files, plus a small **Node.js (v20) build script** for content generation. Do not
introduce React, TypeScript, Vite, Webpack, npm dependencies, or a package manager runtime for the
site itself. The only tooling is Node's standard library for the generation scripts.

## Methodology — Spec-Driven Development (SSD)

Work in this strict order. Do not write production code before the spec is approved.

1. **Specification phase.** Produce a `SPEC.md` covering: goals, non-goals, functional
   requirements (each with an ID like `FR-1`), the content model, the file/module architecture,
   the build pipeline, and acceptance criteria per requirement. Pause and present it for review.
2. **Plan phase.** Break the spec into ordered, independently verifiable phases (see suggested
   phasing below). Each phase lists which requirements it satisfies and how to verify them.
3. **Implementation phase.** Build one phase at a time. After each phase, state which acceptance
   criteria now pass and how you checked (open the page, toggle controls, run the generator).
4. **Verification phase.** End-to-end: load `index.html` in a browser, exercise every control,
   run the Node generator, and confirm generated files are byte-stable on re-run.

Keep the code style consistent: 2-space indentation, no semicolons omitted, small pure functions,
no external runtime libraries beyond Google Fonts (Source Code Pro) and Font Awesome via CDN.

---

## Functional Requirements

### FR-1 — Static, dependency-free single page
- One `index.html` that loads, in order: `content/en.js`, `content/es.generated.js`, `ats.js`,
  `i18n.js`, `script.js`, plus `styles.css`. No build step required to view it — opening the file
  (or serving the folder) must render the full CV.
- Fonts: Source Code Pro (Google Fonts). Icons: Font Awesome 6 (CDN).

### FR-2 — CV content and layout
Render a professional CV for "Felipe Duitama, Systems Engineer" with these sections:
- **Sidebar:** rotating profile photo, name/title (mobile header variant), Contact (phone, email,
  address, GitHub, LinkedIn), Languages (Spanish/English/French with levels), Technical Skills
  (Programming, Frameworks/Tools, Databases — each skill tagged Advanced ● or Intermediate ● via a
  color-dot legend), Soft Skills.
- **Main:** Profile (3 paragraphs), Experience (company header + summary, then per-project
  sub-sections: vEye digital twin, Resource Distribution Tool, HoloLens AR, ARAS/BIMEP HVAC core
  project with 7 bullets, Virtual Takeoff, Commercial Catalogue, 3D Model Viewer), Career
  Objective, Education (university + complementary training), Conferences (year/table).
- Layout is a two-column (sidebar + section) grid, repeated as two `.container` blocks. Accent
  color is a CSS variable (yellow). Fully responsive.

### FR-3 — Bilingual i18n with English as source of truth
- Every translatable node in the HTML carries a `data-i18n="key"` attribute.
- `content/en.js` is the **single source of truth**: a UMD module exposing `window.CV_CONTENT_EN`
  (also `module.exports` under Node) with a flat `key → HTML string` map. Values may contain inline
  markup (`<strong>`, `<span>`).
- A language toggle button switches EN⇄ES, rewrites every `data-i18n` node via `innerHTML`, sets
  `document.documentElement.lang`, and **persists the choice in `localStorage`** (`cvLang`).
- `content/es.generated.js` (UMD → `window.CV_CONTENT_ES`) is machine-generated Spanish. `i18n.js`
  must also contain an **in-browser fallback translator** (phrase-pair + word-pair substitution that
  skips HTML tags) so ES still works if the generated file is missing/empty.

### FR-4 — Content generation pipeline (Node)
- `scripts/generate-content.js` reads `content/en.js` and writes three artifacts:
  `content/es.generated.js` (UMD Spanish), `content/ats.en.txt`, `content/ats.es.txt`.
- `scripts/generator-utils.js` holds the pure logic: `generateSpanishFromEnglish`,
  `buildATSContent`, `writeUMDContentFile`, plus text cleaners. Spanish generation uses the same
  phrase/word pair tables as the browser fallback (keep them in sync conceptually).
- Output must be **deterministic**: re-running the generator with unchanged input produces
  byte-identical files (so a `git diff --exit-code` check can guard staleness).

### FR-5 — ATS mode (`ats.js`, self-contained IIFE exposing `window.ATSFeature`)
- A toggle button flips the page into a plain, single-column, ATS-parseable text view
  (`body.ats-mode`), and back to the designed CV. Button label swaps ATS⇄CV.
- The ATS view is built from the same translation map — role line, contact line, professional
  summary, technical skills (grouped: Languages, Frameworks, Cloud/DevOps, Databases, Testing,
  Tools), experience sections, education, conferences, languages, core competencies.
- A **Download ATS TXT** button downloads a plain-text file named
  `Felipe_Duitama_CV_ATS_<EN|ES>_<YYYY-MM-DD>.txt`. It first tries to fetch the pre-generated
  `content/ats.<lang>.txt`; if that fails it falls back to building the text inline in the browser.
- The generated ATS `.txt` also appends an **ATS KEYWORDS** section extracted from a keyword pool
  (React, Next.js, TypeScript, AWS, Kubernetes, Dijkstra, WebGL, etc.) present in the content.
- ATS view must re-render on language change and be initialized from `i18n.js` via
  `ATSFeature.init({ getCurrentLang, getTranslations, getAtsButtonText })`.

### FR-6 — Photo slideshow with "funny mode" (`script.js`)
- Sidebar shows an auto-advancing photo slider reading from `photos/1.png…N.png`.
- **Normal mode:** 3 photos, 5s interval. **Funny mode** (🧑‍💼 ⇄ 😛 button): 12 photos, 1s interval.
- Photos are discovered by `HEAD` fetch (skip missing files; fall back to `1.png`), rendered once,
  then **lazily loaded** (only current + next image get a real `src`). Active image via `.active`.

### FR-7 — PDF export via print
- A "PDF" button triggers `window.print()`. Before printing, the layout switches to a
  print-friendly single flow: `body.pdf-export-mode`, all `.container` columns **merged** into one
  sidebar + one section, first photo forced visible. `beforeprint`/`afterprint` handlers apply and
  clean up this state. Provide print `@media` CSS so the printed/PDF output is clean (hide control
  buttons, proper page breaks).

### FR-8 — Responsive column merging
- On narrow/web view, the two `.container` blocks merge into a single continuous column
  (`mergeContainersForWebView`), guarded so it runs once (`dataset.merged`). Re-run after language
  toggle and on load via `requestAnimationFrame`.

### FR-9 — Developer automation (git hooks + CI)
- `.githooks/pre-commit` + `scripts/setup-hooks.sh`: when `content/en.js` or the generator scripts
  are staged, regenerate the three artifacts, re-stage them, and run `node --check` on `i18n.js`
  and `script.js`.
- `.github/workflows/content-generation.yml`: on push/PR touching the content/generator files,
  run the generator, fail if generated files are out of date (`git diff --exit-code`), and
  `node --check` the runtime scripts. Use Node 20.

---

## Suggested phasing

1. **Content model + static shell** — `content/en.js`, `index.html` skeleton with all `data-i18n`
   hooks, `styles.css` (layout, responsive, print, ATS-mode, accent variable).
2. **i18n runtime** — `i18n.js`: load EN/ES, toggle, localStorage, fallback translator, DOM update.
3. **Generation pipeline** — `scripts/generator-utils.js` + `generate-content.js`; produce ES + ATS
   txt; verify determinism.
4. **ATS feature** — `ats.js`: view render, toggle, dated TXT download with fetch+fallback.
5. **Photo slideshow + funny mode + lazy loading** — `script.js`.
6. **PDF export + column merging** — print handlers and responsive merge in `script.js` + CSS.
7. **Automation** — git hooks, `setup-hooks.sh`, GitHub Actions workflow.

## Acceptance criteria (verify at the end)
- Opening `index.html` renders the full CV; toggling language swaps every section and survives a
  page reload (localStorage). French/English/Spanish levels show correctly.
- ATS button switches to the text view and back; Download ATS TXT yields a correctly named, dated
  file in the current language.
- Photo slider auto-advances; funny mode changes count/speed and button emoji; missing photos don't
  break it.
- PDF/print output is single-column, clean, with control buttons hidden.
- `node scripts/generate-content.js` runs with zero deps and is idempotent; `git diff --exit-code`
  on the three generated files passes after a second run.
- `node --check i18n.js` and `node --check script.js` pass. The CI workflow and pre-commit hook
  enforce the above.

## Deliverables
```
index.html
styles.css
script.js          # slideshow, funny mode, PDF export, column merge
i18n.js            # language runtime + fallback translator
ats.js             # ATSFeature IIFE
content/en.js              # source of truth (UMD)
content/es.generated.js    # generated (UMD)
content/ats.en.txt         # generated
content/ats.es.txt         # generated
scripts/generate-content.js
scripts/generator-utils.js
scripts/setup-hooks.sh
.githooks/pre-commit
.github/workflows/content-generation.yml
photos/1.png … photos/12.png   # placeholders acceptable
```

Begin with the **Specification phase**: write `SPEC.md` and present it before writing any other code.
