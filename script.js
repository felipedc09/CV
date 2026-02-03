let currentPhotoIndex = 0;
let photos = [];

async function loadPhotos() {
  const photoCount = 3;
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
    let count = 0;
    setInterval(() => {
      count++;
      if (count === photos.length) {
        count = 0;
      }
      showPhoto(count);
    }, 5000);
  }
}

function renderPhotos() {
  const slider = document.getElementById("photoSlider");

  slider.innerHTML = "";

  photos.forEach((photo, index) => {
    const img = document.createElement("img");
    img.src = photo;
    img.alt = "Felipe Duitama - Photo " + (index + 1);
    img.className = index === 0 ? "active" : "";
    slider.appendChild(img);
  });
}

function showPhoto(index) {
  if (photos.length === 0) return;

  currentPhotoIndex = (index + photos.length) % photos.length;
  const imgs = document.querySelectorAll("#photoSlider img");

  imgs.forEach((img, i) => {
    img.classList.toggle("active", i === currentPhotoIndex);
  });
}

function changePhoto(direction) {
  showPhoto(currentPhotoIndex + direction);
}

function activePhoto(img) {
  img.classList.add("active");
  img.style.display = "block";
}

function downloadPDF() {
  const allImgs = document.querySelectorAll("#photoSlider img");
  allImgs.forEach((img, index) => {
    if (index === 0) {
      activePhoto(img);
    } else {
      img.classList.remove("active");
      img.style.display = "none";
    }
  });

  setTimeout(() => {
    window.print();
    allImgs.forEach((img, index) => {
      activePhoto(img);
    });
  }, 100);
}

document.addEventListener("DOMContentLoaded", loadPhotos);
