import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getStorage, ref, uploadBytes, getDownloadURL, listAll } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-storage.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// Od razu pokazujemy główną sekcję i uruchamiamy kamerę
// document.getElementById("auth").style.display = "none";

let currentStream = null;
let currentFacing = "environment";



async function startCamera(facingMode) {
  const video = document.getElementById("camera");
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
    currentStream = null;
  }
  let constraints = { 
    video: { 
      facingMode: facingMode || "environment",
      width: { ideal: 1280 },
      height: { ideal: 1920 }
    } 
  };
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
    currentStream = stream;
  } catch (err) {
    alert("Nie można uzyskać dostępu do kamery: " + err.message);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  startCamera(currentFacing);
});

function takePhoto() {
  const video = document.getElementById("camera");
  const canvas = document.getElementById("canvas");
  // Ustaw proporcje pionowe (np. 3:4)
  const targetWidth = 720;
  const targetHeight = 960;
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  // Wyśrodkuj obraz z kamery na pionowym canvasie
  const ctx = canvas.getContext("2d");
  const videoAspect = video.videoWidth / video.videoHeight;
  const canvasAspect = targetWidth / targetHeight;
  let sx, sy, sw, sh;
  if (videoAspect > canvasAspect) {
    // Kamera szersza niż canvas: przytnij boki
    sh = video.videoHeight;
    sw = sh * canvasAspect;
    sx = (video.videoWidth - sw) / 2;
    sy = 0;
  } else {
    // Kamera wyższa niż canvas: przytnij górę/dół
    sw = video.videoWidth;
    sh = sw / canvasAspect;
    sx = 0;
    sy = (video.videoHeight - sh) / 2;
  }
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);
  canvas.style.display = "block";
  document.getElementById("uploadBtn").style.display = "inline-block";
  video.style.display = "none";
  document.querySelector('button[onclick="takePhoto()"]').style.display = "none";
  document.getElementById("retryBtn").style.display = "inline-block";
  document.getElementById("switchBtn").style.display = "none";
  // Zatrzymaj stream kamery
  if (video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
    video.srcObject = null;
  }
}

async function uploadPhoto() {
  const canvas = document.getElementById("canvas");
  const fileName = `photo_${Date.now()}.png`;
  
  try {
    // Konwertuj canvas na base64
    const imageData = canvas.toDataURL('image/png');
    
    // Wywołaj Firebase Function
    const response = await fetch('https://us-central1-wesele-fa05e.cloudfunctions.net/uploadPhoto', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageData: imageData,
        fileName: fileName
      })
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const result = await response.json();
    
    if (result.success) {
      alert("Zdjęcie wysłane!\nMożesz je zobaczyć tutaj:\n" + result.url);
      document.getElementById("uploadBtn").style.display = "none";
      canvas.style.display = "none";
      const preview = document.createElement("div");
      preview.className = "preview";
      preview.innerHTML = `<p>Zdjęcie dodane! <a href="${result.url}" target="_blank">Zobacz zdjęcie</a></p>`;
      document.getElementById("main").appendChild(preview);
      const video = document.getElementById("camera");
      video.style.display = "block";
      startCamera();
    } else {
      throw new Error('Upload failed');
    }
  } catch (err) {
    alert("Błąd podczas wysyłania zdjęcia: " + err.message);
  }
}

function retryPhoto() {
  const video = document.getElementById("camera");
  const canvas = document.getElementById("canvas");
  canvas.style.display = "none";
  document.getElementById("uploadBtn").style.display = "none";
  document.getElementById("retryBtn").style.display = "none";
  video.style.display = "block";
  document.querySelector('button[onclick="takePhoto()"]').style.display = "inline-block";
  document.getElementById("switchBtn").style.display = "inline-block";
  startCamera();
}

function switchCamera() {
  // Zmień tryb kamery
  currentFacing = currentFacing === "environment" ? "user" : "environment";
  // Zatrzymaj poprzedni stream
  const video = document.getElementById("camera");
  if (video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
    video.srcObject = null;
  }
  // Uruchom nową kamerę
  startCamera(currentFacing);
}
window.switchCamera = switchCamera;

window.takePhoto = takePhoto;
window.uploadPhoto = uploadPhoto;
window.retryPhoto = retryPhoto;

async function loadText(name, elementId) {
  const textRef = ref(storage, name);
  try {
    const url = await getDownloadURL(textRef);
    const res = await fetch(url);
    const text = await res.text();
    const element = document.getElementById(elementId);
    if (element) {
      element.innerText = text;
    }
  } catch {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerText = "";
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  startCamera(currentFacing);
  // loadText("about.txt", "aboutTextDisplay");
  // loadText("schedule.txt", "scheduleTextDisplay");
});

// Funkcja showGallery została usunięta - galeria jest dostępna przez slideshow.html
