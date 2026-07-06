let currentPhotoIndex = 0;
let photos = [];
let slideInterval = null;
let isFunnyMode = false;
let loadedPhotos = new Set();

function mergeContainersForWebView() {
  if (window.innerWidth <= 768) return;

  const cvContent = document.getElementById("cvContent");
  if (!cvContent || cvContent.dataset.merged === "true") return;

  const containers = cvContent.querySelectorAll(".container");
  if (containers.length < 2) return;

  const baseContainer = containers[0];
  const baseSidebar = baseContainer.querySelector(".sidebar");
  const baseSection = baseContainer.querySelector(".section");

  if (!baseSidebar || !baseSection) return;

  for (let i = 1; i < containers.length; i++) {
    const container = containers[i];
    const sidebar = container.querySelector(".sidebar");
    const section = container.querySelector(".section");

    if (sidebar) {
      while (sidebar.firstChild) {
        baseSidebar.appendChild(sidebar.firstChild);
      }
    }

    if (section) {
      while (section.firstChild) {
        baseSection.appendChild(section.firstChild);
      }
    }

    container.remove();
  }

  cvContent.dataset.merged = "true";
}

window.updateWebColumnFlow = () => {
  mergeContainersForWebView();
};

async function loadPhotos(photoCount = 3, intervalTime = 5000) {
  photos = [];
  loadedPhotos.clear();
  const photoList = Array.from(
    { length: photoCount },
    (_, i) => `${i + 1}.png`,
  );

  for (const photo of photoList) {
    const url = `photos/${photo}`;
    try {
      const response = await fetch(url, { method: "HEAD" });
      if (response.ok) {
        photos.push(url);
      }
    } catch (error) {
      console.warn(`Photo not found: ${url}`);
    }
  }

  if (photos.length === 0) {
    photos = ["photos/1.png"];
  }

  if (photos.length > 0) {
    renderPhotos();
    loadImageLazy(0);

    if (slideInterval) {
      clearInterval(slideInterval);
    }

    let count = 0;
    slideInterval = setInterval(() => {
      count++;
      if (count === photos.length) {
        count = 0;
      }
      showPhoto(count);
    }, intervalTime);
  }
}

function funnyMode() {
  const funnyBtn = document.getElementById("funnyMode");

  if (isFunnyMode) {
    loadPhotos(3, 5000);
    funnyBtn.textContent = "🧑‍💼";
    isFunnyMode = false;
  } else {
    loadPhotos(12, 1000);
    funnyBtn.textContent = "😛";
    isFunnyMode = true;
  }
}

function renderPhotos() {
  const slider = document.getElementById("photoSlider");

  slider.innerHTML = "";

  photos.forEach((photo, index) => {
    const img = document.createElement("img");
    img.dataset.src = photo;
    img.dataset.index = index;
    img.alt = "Felipe Duitama - Photo " + (index + 1);
    img.className = index === 0 ? "active" : "";
    img.style.width = "100%";
    img.style.height = "100%";
    slider.appendChild(img);
  });
}

function loadImageLazy(index) {
  if (index >= photos.length || loadedPhotos.has(index)) return;

  const imgs = document.querySelectorAll("#photoSlider img");
  if (imgs[index] && !imgs[index].src) {
    const url = photos[index];
    const img = new Image();
    img.onload = () => {
      imgs[index].src = url;
      loadedPhotos.add(index);
    };
    img.src = url;
  }
}

function showPhoto(index) {
  if (photos.length === 0) return;

  currentPhotoIndex = (index + photos.length) % photos.length;
  const imgs = document.querySelectorAll("#photoSlider img");

  imgs.forEach((img, i) => {
    img.classList.toggle("active", i === currentPhotoIndex);
  });

  // Lazy load current and next image
  loadImageLazy(currentPhotoIndex);
  loadImageLazy((currentPhotoIndex + 1) % photos.length);
}

function changePhoto(direction) {
  showPhoto(currentPhotoIndex + direction);
}

function activePhoto(img) {
  img.classList.add("active");
  img.style.display = "block";
}

async function downloadPDF() {
  const cvContent = document.getElementById("cvContent");
  if (!cvContent) return;

  if (typeof html2pdf === "undefined") {
    alert("PDF export library is not available.");
    return;
  }

  const lang = typeof currentLang === "string" ? currentLang : "en";
  const now = new Date().toISOString().slice(0, 10);
  const firstPhoto = document.querySelector("#photoSlider img:first-child");

  if (firstPhoto) {
    firstPhoto.classList.add("active");
    firstPhoto.style.display = "block";
    if (!firstPhoto.src && photos[0]) {
      firstPhoto.src = photos[0];
    }
  }

  await new Promise((resolve) => window.requestAnimationFrame(() => resolve()));

  const options = {
    margin: [6, 6, 6, 6],
    filename: `Felipe_Duitama_CV_${lang}_${now}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      windowWidth: 794,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDocument) => {
        const clonedBody = clonedDocument.body;
        const clonedHtml = clonedDocument.documentElement;
        const clonedCvContent = clonedDocument.getElementById("cvContent");

        const pdfStyle = clonedDocument.createElement("style");
        pdfStyle.textContent = `
          @page {
            size: A4;
            margin: 10mm;
          }

          html, body {
            width: 100%;
            height: auto;
            margin: 0;
            padding: 0;
            background: #fff;
          }

          body {
            display: block !important;
            gap: 0 !important;
          }

          body .top-controls,
          body .lang-toggle,
          body .download-btn,
          body .ats-btn,
          body .funny-btn {
            display: none !important;
          }

          #cvContent {
            width: 718px !important;
            max-width: 718px !important;
            margin: 0 !important;
          }

          #cvContent .container {
            width: 718px !important;
            max-width: 718px !important;
            min-height: 0 !important;
            height: auto !important;
            margin: 0 !important;
            display: flex !important;
            flex-direction: row !important;
            overflow: hidden !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid-page !important;
          }

          #cvContent .container:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }

          #cvContent .sidebar {
            width: 35% !important;
            display: flex !important;
            flex-direction: column !important;
            padding: 0 !important;
            min-width: 0 !important;
          }

          #cvContent .main-content,
          #cvContent .section {
            width: 65% !important;
            min-width: 0 !important;
          }

          #cvContent .main-text,
          #cvContent .main-list,
          #cvContent .exp-box,
          #cvContent .edu-grid,
          #cvContent .conf-table,
          #cvContent .contact-item,
          #cvContent .skill-item {
            min-width: 0 !important;
          }

          #cvContent .photo-container,
          #cvContent .slider-wrapper {
            height: 52mm !important;
          }

          #cvContent .slider-wrapper img {
            transition: none !important;
          }

          #cvContent .section,
          #cvContent .main-text,
          #cvContent .main-list,
          #cvContent .exp-box,
          #cvContent .edu-grid,
          #cvContent .conf-table,
          #cvContent .contact-item,
          #cvContent .skill-item {
            break-inside: avoid-page !important;
            page-break-inside: avoid !important;
          }
        `;
        clonedDocument.head.appendChild(pdfStyle);

        if (clonedHtml) {
          clonedHtml.style.background = "white";
          clonedHtml.style.width = "100%";
          clonedHtml.style.height = "auto";
        }

        if (clonedBody) {
          clonedBody.classList.add("pdf-export-mode");
          clonedBody.style.background = "white";
          clonedBody.style.margin = "0";
          clonedBody.style.padding = "0";
          clonedBody.style.display = "block";
        }

        if (clonedCvContent) {
          clonedCvContent.style.width = "var(--page-content-width)";
          clonedCvContent.style.maxWidth = "var(--page-content-width)";
          clonedCvContent.style.margin = "0 auto";
        }
      },
    },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ["avoid-all", "css", "legacy"] },
  };

  try {
    await html2pdf().set(options).from(cvContent).save();
  } finally {
  }
}

document.addEventListener("DOMContentLoaded", () => loadPhotos(3, 5000));
document.addEventListener("DOMContentLoaded", () => {
  mergeContainersForWebView();
  window.requestAnimationFrame(mergeContainersForWebView);
});
