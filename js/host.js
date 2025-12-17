import { db, auth } from "./firebase.js";
import { ref, onValue, update } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

const room = new URLSearchParams(location.search).get("room");
document.getElementById("room").textContent = `Room: ${room}`;

const roomRef = ref(db, `rooms/${room}`);

document.getElementById("add").onclick = () => {
  const name = document.getElementById("name").value;
  update(ref(db, `rooms/${room}/approvedNames`), {
    [name]: true
  });
};

onValue(roomRef, snap => {
  const data = snap.val();
  const list = document.getElementById("names");
  list.innerHTML = "";
  Object.keys(data.approvedNames || {}).forEach(n => {
    const li = document.createElement("li");
    li.textContent = n;
    list.appendChild(li);
  });
});

document.getElementById("start").onclick = async () => {
  const snap = await (await fetch()).json();
};
