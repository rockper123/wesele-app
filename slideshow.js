import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getStorage, ref, listAll } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-storage.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function getPhotoUrls() {
  const listRef = ref(storage, 'photos');
  const res = await listAll(listRef);
  return res.items.map(itemRef =>
    `https://firebasestorage.googleapis.com/v0/b/${storage.app.options.storageBucket}/o/photos%2F${encodeURIComponent(itemRef.name)}?alt=media`
  );
}

async function startSlideshow() {
  const img = document.getElementById("slideshow-img");
  let urls = await getPhotoUrls();
  if (urls.length === 0) {
    img.alt = "Brak zdjęć";
    img.style.display = "none";
    return;
  }
  let idx = 0;
  function showNext() {
    img.src = urls[idx];
    idx = (idx + 1) % urls.length;
  }
  showNext();
  setInterval(showNext, 5000); // zmiana co 5 sekund
}

startSlideshow();