import { db, auth, authReady } from "./firebase.js";
import { ref, set, onValue, update, get } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

await authReady; // wait for auth

// Get room code from URL
const room = new URLSearchParams(window.location.search).get("room");
if (!room) throw new Error("Missing room code");

const roomRef = ref(db, `rooms/${room}`);
const wordInput = document.getElementById("word");
const numImpostersInput = document.getElementById("numImposters");

const playersList = document.getElementById("players");
const newHostSelect = document.getElementById("newHost");

document.getElementById("room").textContent = `Room: ${room}`;

// --------------------
// Create room if not exists
// --------------------
const roomSnap = await get(roomRef);
if (!roomSnap.exists()) {
  await set(roomRef, {
    hostId: auth.currentUser.uid,
    word: "Example",
    numImposters: 1,
    status: "lobby",
    players: {}
  });
}

// --------------------
// Listen for players and update UI
// --------------------
onValue(roomRef, snap => {
  const data = snap.val();
  if (!data) return;

  playersList.innerHTML = "";
  newHostSelect.innerHTML = "";

  const players = data.players || {};

  Object.entries(players).forEach(([uid, player]) => {
    const li = document.createElement("li");
    li.textContent = `${player.name}${uid === data.hostId ? " (Host)" : ""}`;
    playersList.appendChild(li);

    if (uid !== data.hostId) {
      const opt = document.createElement("option");
      opt.value = uid;
      opt.textContent = player.name;
      newHostSelect.appendChild(opt);
    }
  });

  wordInput.value = data.word || "";
  numImpostersInput.value = data.numImposters || 1;
});

// --------------------
// Start game
// --------------------
document.getElementById("start").onclick = async () => {
  const dataSnap = await get(roomRef);
  const data = dataSnap.val();
  const players = Object.keys(data.players || {});

  if (players.length <= 0) {
    alert("No players joined yet!");
    return;
  }

  const word = wordInput.value.trim();
  const numImposters = parseInt(numImpostersInput.value);

  if (!word || numImposters < 1 || numImposters >= players.length) {
    alert("Check word or number of imposters");
    return;
  }

  // Shuffle players
  const shuffled = [...players].sort(() => Math.random() - 0.5);
  const imposters = shuffled.slice(0, numImposters);

  for (const uid of players) {
    await update(ref(db, `rooms/${room}/players/${uid}`), {
      role: imposters.includes(uid) ? "imposter" : "word"
    });
  }

  await update(roomRef, {
    status: "started",
    word,
    numImposters
  });
};

// --------------------
// Reset / restart game
// --------------------
document.getElementById("reset").onclick = async () => {
  const dataSnap = await get(roomRef);
  const players = dataSnap.val()?.players || {};

  for (const uid in players) {
    await update(ref(db, `rooms/${room}/players/${uid}`), { role: null });
  }

  await update(roomRef, { status: "lobby" });
};

// --------------------
// Transfer host
// --------------------
document.getElementById("transfer").onclick = async () => {
  const newHost = newHostSelect.value;
  if (!newHost) return;
  await update(roomRef, { hostId: newHost });
};
