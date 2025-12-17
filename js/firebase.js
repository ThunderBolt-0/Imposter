import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyB6rCQsoYTNiHw2inYd09CuyTLWCUliU5Y",
  authDomain: "imposter-a242a.firebaseapp.com",
  databaseURL: "https://imposter-a242a-default-rtdb.firebaseio.com",
  projectId: "imposter-a242a",
  storageBucket: "imposter-a242a.firebasestorage.app",
  messagingSenderId: "711198240278",
  appId: "1:711198240278:web:20b726542d005c2ec1cf37"
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);

export const authReady = new Promise(resolve => {
  onAuthStateChanged(auth, user => {
    if (user) resolve(user);
  });
});

signInAnonymously(auth);
