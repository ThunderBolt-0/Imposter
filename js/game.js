import { db, auth } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

const room = new URLSearchParams(location.search).get("room");

onValue(ref(db, `rooms/${room}/players/${auth.currentUser.uid}`), snap => {
  const role = snap.val().role;
  document.getElementById("result").textContent =
    role === "word" ? "You know the word" : "You are the imposter";
});
