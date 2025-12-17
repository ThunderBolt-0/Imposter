import { db, auth } from "./firebase.js";
import { ref, onValue } from
"https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

const room = new URLSearchParams(location.search).get("room");

onValue(ref(db, `rooms/${room}`), snap => {
  const data = snap.val();
  const player = data.players[auth.currentUser.uid];

  if (!player || data.status !== "started") return;

  document.getElementById("result").textContent =
    player.role === "word"
      ? `The word is: ${data.word}`
      : "You are the IMPOSTER";
});
