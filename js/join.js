import { db, auth, authReady } from "./firebase.js";
import { ref, set, onValue, get } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

await authReady;

const room = new URLSearchParams(window.location.search).get("room");
if (!room) throw new Error("Missing room code");

const nameInput = document.getElementById("name");
const joinBtn = document.getElementById("join");

const roomRef = ref(db, `rooms/${room}`);
const playerRef = ref(db, `rooms/${room}/players/${auth.currentUser.uid}`);

// Join button
joinBtn.onclick = async () => {
  const name = nameInput.value.trim();
  if (!name) {
    alert("Enter your name");
    return;
  }

  const roomSnap = await get(roomRef);
  if (!roomSnap.exists()) {
    alert("Room does not exist");
    return;
  }

  if (roomSnap.val().status !== "lobby") {
    alert("Game already started");
    return;
  }

  // This ensures each player writes to their own UID child
  await set(playerRef, { name });

  joinBtn.disabled = true;
};

// Optional: redirect to game when host starts
onValue(roomRef, snap => {
  const data = snap.val();
  if (data?.status === "started") {
    window.location.href = `game.html?room=${room}`;
  }
});
