import { db, auth, authReady } from "./firebase.js";
import { ref, set, onValue, get } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

await authReady; // wait for auth

const room = new URLSearchParams(window.location.search).get("room");
if (!room) {
  alert("Missing room code");
  throw new Error("No room code");
}

const nameInput = document.getElementById("name");
const joinBtn = document.getElementById("join");

const playerRef = ref(db, `rooms/${room}/players/${auth.currentUser.uid}`);
const roomRef = ref(db, `rooms/${room}`);

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

  // Save player name freely
  await set(playerRef, { name });

  joinBtn.disabled = true;
};

// Redirect when game starts
onValue(roomRef, snap => {
  if (snap.val()?.status === "started") {
    window.location.href = `game.html?room=${room}`;
  }
});
