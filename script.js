let currentPhotoIndex = 0;
let photos = [];
let slideInterval = null;
let isFunnyMode = false;
let loadedPhotos = new Set();

const PHOTO_CONFIG = {
  normal: { count: 3, interval: 5000, buttonLabel: "🧑‍💼" },
  funny: { count: 12, interval: 1000, buttonLabel: "😛" }
};

function stopSlideshow() {
  if (slideInterval) {
    clearInterval(slideInterval);
    slideInterval = null;
  }
}

function mergeContainersForWebView(force = false) {
  if (!force && window.innerWidth <= 768) return;

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

    stopSlideshow();

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
  if (!funnyBtn) return;

  isFunnyMode = !isFunnyMode;
  const mode = isFunnyMode ? PHOTO_CONFIG.funny : PHOTO_CONFIG.normal;

  loadPhotos(mode.count, mode.interval);
  funnyBtn.textContent = mode.buttonLabel;
}

function renderPhotos() {
  const slider = document.getElementById("photoSlider");
  if (!slider) return;

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

function preparePdfExport() {
  const cvContent = document.getElementById("cvContent");
  const body = document.body;

  if (!cvContent || !body) return;

  mergeContainersForWebView(true);
  body.classList.add("pdf-export-mode");

  const firstPhoto = document.querySelector("#photoSlider img:first-child");

  if (firstPhoto) {
    firstPhoto.classList.add("active");
    firstPhoto.style.display = "block";

    if (!firstPhoto.src && photos[0]) {
      firstPhoto.src = photos[0];
    }
  }

  loadImageLazy(0);
  loadImageLazy(1);

  void cvContent.offsetHeight;
}

function cleanupPdfExport() {
  if (document.body) {
    document.body.classList.remove("pdf-export-mode");
  }
}

function downloadPDF() {
  const cvContent = document.getElementById("cvContent");
  if (!cvContent) return;

  if (typeof window.print !== "function") {
    alert("Print is not available in this browser.");
    return;
  }

  preparePdfExport();
  window.print();
}

function bindControlEvents() {
  const funnyBtn = document.getElementById("funnyMode");
  const pdfBtn = document.getElementById("downloadPDF");
  const atsBtn = document.getElementById("downloadATS");

  if (funnyBtn) {
    funnyBtn.addEventListener("click", funnyMode);
  }

  if (pdfBtn) {
    pdfBtn.addEventListener("click", downloadPDF);
  }

  if (atsBtn && typeof window.toggleATSMode === "function") {
    atsBtn.addEventListener("click", window.toggleATSMode);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  bindControlEvents();
  loadPhotos(PHOTO_CONFIG.normal.count, PHOTO_CONFIG.normal.interval);
  mergeContainersForWebView();
  window.requestAnimationFrame(mergeContainersForWebView);
});

window.addEventListener("beforeprint", preparePdfExport);
window.addEventListener("afterprint", cleanupPdfExport);

window.funnyMode = funnyMode;
window.downloadPDF = downloadPDF;
window.changePhoto = changePhoto;
