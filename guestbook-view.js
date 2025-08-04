import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase, ref, onChildAdded } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const guestbookRef = ref(db, "guestbook");

const allGuestbookMessages = document.getElementById("allGuestbookMessages");
onChildAdded(guestbookRef, (snapshot) => {
  const { name, wish } = snapshot.val();
  const div = document.createElement("div");
  div.innerHTML = `<b>${name}:</b> ${wish}`;
  allGuestbookMessages.appendChild(div);
});