import { db, auth, authReady } from "./firebase.js";
import {
  ref,
  onValue,
  update,
  get
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

// --------------------
// INITIAL SETUP
// --------------------
const room = new URLSearchParams(location.search).get("room");
if (!room) {
  alert("No room code");
  throw new Error("Missing room code");
}

await authReady; // 🔑 CRITICAL FIX

const roomRef = ref(db, `rooms/${room}`);

document.getElementById("room").textContent = `Room: ${room}`;

// --------------------
// ADD APPROVED NAMES
// --------------------
const nameInput = document.getElementById("name");
const addBtn = document.getElementById("add");

addBtn.onclick = async () => {
  const name = nameInput.value.trim();

  if (!name) {
    alert("Enter a name");
    return;
  }

  await update(ref(db, `rooms/${room}/approvedNames`), {
    [name]: true
  });

  nameInput.value = "";
};

// --------------------
// START GAME
// --------------------
document.getElementById("start").onclick = async () => {
  const snap = await get(roomRef);
  const data = snap.val();

  if (!data.players) {
    alert("No players joined");
    return;
  }

  const uids = Object.keys(data.players);
  if (uids.length <= data.numImposters) {
    alert("Not enough players");
    return;
  }

  // Shuffle players
  uids.sort(() => Math.random() - 0.5);

  const imposters = new Set(
    uids.slice(0, data.numImposters)
  );

  for (const uid of uids) {
    await update(ref(db, `rooms/${room}/players/${uid}`), {
      role: imposters.has(uid) ? "imposter" : "word"
    });
  }

  await update(roomRef, { status: "started" });
};

// --------------------
// RESET GAME
// --------------------
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

// --------------------
// TRANSFER HOST
// --------------------
document.getElementById("transfer").onclick = async () => {
  const newHost = document.getElementById("newHost").value;
  if (!newHost) return;

  await update(roomRef, { hostId: newHost });
};

// --------------------
// LIVE UI UPDATES
// --------------------
onValue(roomRef, snap => {
  const data = snap.val();
  if (!data) return;

  // Player list
  const playerList = document.getElementById("players");
  const hostSelect = document.getElementById("newHost");

  playerList.innerHTML = "";
  hostSelect.innerHTML = "";

  Object.entries(data.players || {}).forEach(([uid, player]) => {
    const li = document.createElement("li");
    li.textContent =
      player.name +
      (uid === data.hostId ? " (Host)" : "");
    playerList.appendChild(li);

    if (uid !== data.hostId) {
      const opt = document.createElement("option");
      opt.value = uid;
      opt.textContent = player.name;
      hostSelect.appendChild(opt);
    }
  });
});
