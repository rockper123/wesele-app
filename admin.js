import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-storage.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function loadText(name, textareaId) {
  const textRef = ref(storage, name);
  try {
    const url = await getDownloadURL(textRef);
    const res = await fetch(url);
    const text = await res.text();
    document.getElementById(textareaId).value = text;
  } catch {
    document.getElementById(textareaId).value = "";
  }
}

async function saveText(name, textareaId) {
  const textRef = ref(storage, name);
  const value = document.getElementById(textareaId).value;
  await uploadString(textRef, value, 'raw');
}

document.getElementById("editForm").onsubmit = async (e) => {
  e.preventDefault();
  await saveText("about.txt", "aboutText");
  await saveText("schedule.txt", "scheduleText");
  alert("Zapisano zmiany!");
};

const CORRECT_PASSWORD = "Kondo5544++";

document.getElementById("loginBtn").onclick = () => {
  const pass = document.getElementById("adminPass").value;
  if (pass === CORRECT_PASSWORD) {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("admin-panel").style.display = "block";
    // tutaj możesz wywołać funkcje ładowania panelu, np. loadPhotos();
    loadPhotos();
    loadText("about.txt", "aboutText");
    loadText("schedule.txt", "scheduleText");
  } else {
    document.getElementById("loginError").innerText = "Nieprawidłowe hasło!";
  }
};

loadText("about.txt", "aboutText");
loadText("schedule.txt", "scheduleText");

async function loadPhotos() {
  const photosDiv = document.getElementById("photos");
  photosDiv.innerHTML = "<p>Ładowanie zdjęć...</p>";
  const listRef = ref(storage, 'photos');
  try {
    const res = await listAll(listRef);
    if (res.items.length === 0) {
      photosDiv.innerHTML = "<p>Brak zdjęć.</p>";
      return;
    }
    photosDiv.innerHTML = "";
    for (const itemRef of res.items) {
      const url = `https://firebasestorage.googleapis.com/v0/b/${storage.app.options.storageBucket}/o/photos%2F${encodeURIComponent(itemRef.name)}?alt=media`;
      const photoBox = document.createElement("div");
      photoBox.className = "preview";
      photoBox.innerHTML = `
        <img src="${url}" style="max-width:100%;border-radius:12px;margin-bottom:8px;" />
        <p>${itemRef.name}</p>
        <button onclick="deletePhoto('${itemRef.fullPath}')">Usuń</button>
      `;
      photosDiv.appendChild(photoBox);
    }
  } catch (err) {
    photosDiv.innerHTML = "<p>Błąd ładowania zdjęć.</p>";
  }
}

window.deletePhoto = async function(path) {
  if (!confirm("Czy na pewno usunąć to zdjęcie?")) return;
  const photoRef = ref(storage, path);
  try {
    await deleteObject(photoRef);
    loadPhotos();
  } catch (err) {
    alert("Błąd podczas usuwania zdjęcia: " + err.message);
  }
};

loadPhotos();