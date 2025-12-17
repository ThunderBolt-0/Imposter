import { db, auth, authReady } from "./firebase.js";
import { ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

// Get room code from URL
const room = new URLSearchParams(window.location.search).get("room");
if (!room) {
  alert("No room code");
  throw new Error("Missing room code");
}

await authReady; // wait for Firebase auth

const approvedRef = ref(db, `rooms/${room}/approvedNames`);
const playerRef = ref(db, `rooms/${room}/players/${auth.currentUser.uid}`);
const roomRef = ref(db, `rooms/${room}`);

const select = document.getElementById("names");
const joinBtn = document.getElementById("join");

// Listen for approved names
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

// Join button
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

  // Save player selection
  await set(playerRef, { name: select.value });

  joinBtn.disabled = true;
};

// Redirect when game starts
onValue(roomRef, snap => {
  if (snap.val()?.status === "started") {
    window.location.href = `game.html?room=${room}`;
  }
});
