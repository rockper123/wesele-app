import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const guestbookRef = ref(db, "guestbook");

document.getElementById("guestSendBtn").onclick = () => {
  const name = document.getElementById("guestName").value.trim() || "Gość";
  const wish = document.getElementById("guestWish").value.trim();
  if (!wish) return;
  push(guestbookRef, { name, wish, time: Date.now() });
  document.getElementById("guestWish").value = "";
};

const guestbookMessages = document.getElementById("guestbookMessages");
onChildAdded(guestbookRef, (snapshot) => {
  const { name, wish } = snapshot.val();
  const div = document.createElement("div");
  div.innerHTML = `<b>${name}:</b> ${wish}`;
  guestbookMessages.appendChild(div);
  guestbookMessages.scrollTop = guestbookMessages.scrollHeight;
});