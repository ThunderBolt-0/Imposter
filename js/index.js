import { db, auth } from "./firebase.js";
import { ref, set, get } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

function code() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

document.getElementById("create").onclick = async () => {
  const word = document.getElementById("word").value;
  const imposters = Number(document.getElementById("imposters").value);
  const room = code();

  await set(ref(db, `rooms/${room}`), {
    hostId: auth.currentUser.uid,
    word,
    numImposters: imposters,
    status: "lobby",
    approvedNames: {},
    players: {}
  });

  location.href = `host.html?room=${room}`;
};

document.getElementById("join").onclick = () => {
  const room = document.getElementById("code").value.toUpperCase();
  location.href = `join.html?room=${room}`;
};
