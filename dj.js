import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-storage.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const songsRef = ref(db, "songs");

const djSongsList = document.getElementById("djSongsList");
onChildAdded(songsRef, (snapshot) => {
  const { song } = snapshot.val();
  const div = document.createElement("div");
  div.innerHTML = `🎵 ${song}`;
  djSongsList.appendChild(div);
});