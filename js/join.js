import { db, auth, authReady } from "./firebase.js";
import { ref, set, onValue, get } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

await authReady;

const room = new URLSearchParams(window.location.search).get("room");
if (!room) throw new Error("Missing room code");

const nameInput = document.getElementById("name");
const joinBtn = document.getElementById("join");

// Each player writes under their own UID
const playerRef = ref(db, `rooms/${room}/players/${auth.currentUser.uid}`);
const roomRef = ref(db, `rooms/${room}`);

joinBtn.onclick = async () => {
  const name = nameInput.value.trim();
  if (!name) return alert("Enter a name");

  const roomSnap = await get(roomRef);
  if (!roomSnap.exists()) return alert("Room does not exist");

  if (roomSnap.val().status !== "lobby")
    return alert("Game already started");

  // 🔑 THIS IS THE FIX
  // set() under the UID prevents overwriting others
  await set(playerRef, { name });

  joinBtn.disabled = true;
};
