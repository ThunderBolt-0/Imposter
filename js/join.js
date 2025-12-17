import { db, auth } from "./firebase.js";
import {
  ref,
  onValue,
  set,
  get
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

const room = new URLSearchParams(location.search).get("room");
const select = document.getElementById("names");
const joinBtn = document.getElementById("join");

const roomRef = ref(db, `rooms/${room}`);
const playerRef = ref(db, `rooms/${room}/players/${auth.currentUser.uid}`);

onValue(ref(db, `rooms/${room}/approvedNames`), snap => {
  select.innerHTML = "";
  Object.keys(snap.val() || {}).forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    select.appendChild(opt);
  });
});

joinBtn.onclick = async () => {
  const roomSnap = await get(roomRef);
  if (roomSnap.val().status !== "lobby") {
    alert("Game already started");
    return;
  }

  await set(playerRef, {
    name: select.value
  });

  joinBtn.disabled = true;
};

onValue(roomRef, snap => {
  if (snap.val().status === "started") {
    location.href = `game.html?room=${room}`;
  }
});
