import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const songsRef = ref(db, "songs");

document.getElementById("songSendBtn").onclick = () => {
  const song = document.getElementById("songName").value.trim();
  if (!song) return;
  push(songsRef, { song, time: Date.now() });
  document.getElementById("songName").value = "";
};

const songsList = document.getElementById("songsList");
onChildAdded(songsRef, (snapshot) => {
  const { song } = snapshot.val();
  const div = document.createElement("div");
  div.innerHTML = `🎵 ${song}`;
  songsList.appendChild(div);
  songsList.scrollTop = songsList.scrollHeight;
});