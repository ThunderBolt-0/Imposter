import { db, auth, authReady } from "./firebase.js";
import { ref, onValue, set, get } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

// ----------------
// GET ROOM
// ----------------
const room = new URLSearchParams(location.search).get("room");
if (!room) {
  alert("Missing room code");
  throw new Error("Missing room code");
}

await authReady; // <-- MUST wait for auth

const approvedRef = ref(db, `rooms/${room}/approvedNames`);
const playerRef = ref(db, `rooms/${room}/players/${auth.currentUser.uid}`);
const roomRef = ref(db, `rooms/${room}`);

const select = document.getElementById("names");
const joinBtn = document.getElementById("join");

// ----------------
// LISTEN APPROVED NAMES
// ----------------
onValue(approvedRef, snap => {
  const names = snap.val();
  select.innerHTML = "";

  if (!names) {
    const opt = document.createElement("option");
    opt.textContent = "Waiting for host...";
    opt.disabled = true;
    select.appendChild(opt);
    return;
  }

  Object.keys(names).forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    select.appendChild(opt);
  });
});

// ----------------
// JOIN BUTTON
// ----------------
joinBtn.onclick = async () => {
  const roomSnap = await get(roomRef);

  if (!roomSnap.exists()) {
    alert("Room does not exist");
    return;
  }

  if (roomSnap.val().status !== "lobby") {
    alert("Game already started");
    return;
  }

  await set(playerRef, {
    name: select.value
  });

  joinBtn.disabled = true;
};

// ----------------
// AUTO-REDIRECT WHEN GAME STARTS
// ----------------
onValue(roomRef, snap => {
  const data = snap.val();
  if (data?.status === "started") {
    location.href = `game.html?room=${room}`;
  }
});
