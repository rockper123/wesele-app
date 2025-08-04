import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getStorage, ref, listAll, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-storage.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const gallery = document.getElementById("gallery");

listAll(ref(storage, 'photos')).then(res => {
  res.items.forEach(itemRef => {
    getDownloadURL(itemRef).then(url => {
      const img = document.createElement("img");
      img.src = url;
      gallery.appendChild(img);
    });
  });
});