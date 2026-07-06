#!/usr/bin/env node

const path = require("path");
const fs = require("fs");
const english = require("../content/en.js");
const {
  generateSpanishFromEnglish,
  buildATSContent,
  writeUMDContentFile
} = require("./generator-utils");

const root = path.resolve(__dirname, "..");
const contentDir = path.join(root, "content");
const spanishFile = path.join(contentDir, "es.generated.js");
const atsEnFile = path.join(contentDir, "ats.en.txt");
const atsEsFile = path.join(contentDir, "ats.es.txt");

if (!fs.existsSync(contentDir)) {
  fs.mkdirSync(contentDir, { recursive: true });
}

const spanish = generateSpanishFromEnglish(english);
const translations = {
  en: english,
  es: spanish
};

writeUMDContentFile(
  spanishFile,
  "CV_CONTENT_ES",
  spanish,
  "Auto-generated from content/en.js. Do not edit manually."
);

fs.writeFileSync(atsEnFile, buildATSContent(translations, "en"), "utf8");
fs.writeFileSync(atsEsFile, buildATSContent(translations, "es"), "utf8");

console.log("Generated content/es.generated.js");
console.log("Generated content/ats.en.txt");
console.log("Generated content/ats.es.txt");
