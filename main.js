import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getStorage, ref, uploadBytes, getDownloadURL, listAll } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-storage.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

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
  const targetWidth = 720;
  const targetHeight = 960;
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");
  const videoAspect = video.videoWidth / video.videoHeight;
  const canvasAspect = targetWidth / targetHeight;
  let sx, sy, sw, sh;
  if (videoAspect > canvasAspect) {
    sh = video.videoHeight;
    sw = sh * canvasAspect;
    sx = (video.videoWidth - sw) / 2;
    sy = 0;
  } else {
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
  if (video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
    video.srcObject = null;
  }
}

async function uploadPhoto() {
  const canvas = document.getElementById("canvas");
  const fileName = `photo_${Date.now()}.png`;
  const storageRef = ref(storage, `photos/${fileName}`);
  
  try {
    canvas.toBlob(async (blob) => {
      try {
        await uploadBytes(storageRef, blob);
        const url = `https://firebasestorage.googleapis.com/v0/b/${storage.app.options.storageBucket}/o/photos%2F${encodeURIComponent(fileName)}?alt=media`;
        alert("Zdjęcie wysłane!\nMożesz je zobaczyć tutaj:\n" + url);
        document.getElementById("uploadBtn").style.display = "none";
        canvas.style.display = "none";
        const preview = document.createElement("div");
        preview.className = "preview";
        preview.innerHTML = `<p>Zdjęcie dodane! <a href="${url}" target="_blank">Zobacz zdjęcie</a></p>`;
        document.getElementById("main").appendChild(preview);
        const video = document.getElementById("camera");
        video.style.display = "block";
        startCamera();
      } catch (err) {
        alert("Błąd podczas wysyłania zdjęcia: " + err.message);
      }
    }, "image/png");
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
  currentFacing = currentFacing === "environment" ? "user" : "environment";
  const video = document.getElementById("camera");
  if (video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
    video.srcObject = null;
  }
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
