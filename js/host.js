import { db, auth } from "./firebase.js";
import {
  ref,
  onValue,
  update,
  get,
  remove
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

const room = new URLSearchParams(location.search).get("room");
const roomRef = ref(db, `rooms/${room}`);

document.getElementById("room").textContent = `Room: ${room}`;

document.getElementById("add").onclick = () => {
  const name = document.getElementById("name").value.trim();
  if (!name) return;

  update(ref(db, `rooms/${room}/approvedNames`), {
    [name]: true
  });
};

document.getElementById("start").onclick = async () => {
  const snap = await get(roomRef);
  const data = snap.val();

  const uids = Object.keys(data.players || {});
  if (uids.length <= data.numImposters) {
    alert("Not enough players");
    return;
  }

  uids.sort(() => Math.random() - 0.5);
  const imposters = new Set(uids.slice(0, data.numImposters));

  for (const uid of uids) {
    await update(ref(db, `rooms/${room}/players/${uid}`), {
      role: imposters.has(uid) ? "imposter" : "word"
    });
  }

  await update(roomRef, { status: "started" });
};

document.getElementById("reset").onclick = async () => {
  const snap = await get(roomRef);
  const players = snap.val().players || {};

  for (const uid in players) {
    await update(ref(db, `rooms/${room}/players/${uid}`), {
      role: null
    });
  }

  await update(roomRef, { status: "lobby" });
};

document.getElementById("transfer").onclick = async () => {
  const newHost = document.getElementById("newHost").value;
  await update(roomRef, { hostId: newHost });
};

onValue(roomRef, snap => {
  const data = snap.val();
  const list = document.getElementById("players");
  list.innerHTML = "";

  Object.entries(data.players || {}).forEach(([uid, p]) => {
    const li = document.createElement("li");
    li.textContent = `${p.name} (${uid === data.hostId ? "Host" : "Player"})`;
    list.appendChild(li);
  });
});
