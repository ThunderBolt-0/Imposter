import { db, auth } from "./firebase.js";
import { ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

const room = new URLSearchParams(location.search).get("room");
const select = document.getElementById("names");

onValue(ref(db, `rooms/${room}/approvedNames`), snap => {
  select.innerHTML = "";
  Object.keys(snap.val() || {}).forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    select.appendChild(opt);
  });
});

document.getElementById("join").onclick = async () => {
  await set(ref(db, `rooms/${room}/players/${auth.currentUser.uid}`), {
    name: select.value
  });
};
