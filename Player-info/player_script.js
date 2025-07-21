// --- Firebase Setup ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDKjvERjZEGVOkcBtlduUZFA6kRk6k-B18",
  authDomain: "modernformulaghost.firebaseapp.com",
  projectId: "modernformulaghost",
  storageBucket: "modernformulaghost.appspot.com",
  messagingSenderId: "719727118512",
  appId: "1:719727118512:web:b0a50f708a5a5987895a0b",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// --- Login Modal ---
const loginModal = document.getElementById("loginModal");
const loginBtn = document.getElementById("loginBtn");
const closeLogin = document.getElementById("closeLogin");

loginBtn.addEventListener("click", () => {
  loginModal.style.display = "flex";
});
closeLogin.addEventListener("click", () => {
  loginModal.style.display = "none";
});
window.addEventListener("click", (e) => {
  if (e.target === loginModal) loginModal.style.display = "none";
});

// --- Login Auth Handler ---
const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginError = document.getElementById("loginError");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value)
    .then(() => {
      loginModal.style.display = "none";
      loginForm.reset();
      loginError.textContent = "";
    })
    .catch((error) => {
      loginError.textContent = error.message;
    });
});

// --- Upload Modal Logic ---
document.addEventListener("DOMContentLoaded", () => {
  const uploadModal = document.getElementById("uploadModal");
  const uploadBtn = document.getElementById("uploadBtn");
  const closeUpload = document.getElementById("closeUpload");
  const uploadForm = document.getElementById("uploadForm");

  // Show Upload Modal
  uploadBtn.addEventListener("click", () => {
    if (auth.currentUser) {
      uploadModal.style.display = "flex";
    } else {
      alert("You must be logged in to upload a player.");
    }
  });

  closeUpload.addEventListener("click", () => {
    uploadModal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === uploadModal) uploadModal.style.display = "none";
  });

  uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return alert("Login required.");

    const ign = document.getElementById("ign").value;
    const drivetrain = document.getElementById("drivetrain").value;
    const clanRank = document.getElementById("clanRank").value;
    const playerId = document.getElementById("playerId").value;
    const imageFile = document.getElementById("playerImage").files[0];

    if (!imageFile) return alert("Please select an image.");

    const imageRef = ref(storage, `players/${Date.now()}_${imageFile.name}`);
    await uploadBytes(imageRef, imageFile);
    const imageUrl = await getDownloadURL(imageRef);

    await addDoc(collection(db, "players"), {
      ign,
      drivetrain,
      clanRank,
      playerId,
      imageUrl,
      uid: user.uid,
      email: user.email,
      timestamp: serverTimestamp()
    });

    alert("Player uploaded!");
    uploadForm.reset();
    uploadModal.style.display = "none";
    loadPlayers();
  });

  // --- Load Player Cards ---
  async function loadPlayers() {
    const container = document.getElementById("playerContainer");
    container.innerHTML = "";
    const user = auth.currentUser;

    const q = query(collection(db, "players"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const isOwner = user && (user.uid === data.uid || isAdmin(user.email));

      const card = document.createElement("div");
      card.className = "player-card";
      card.innerHTML = `
        <img src="${data.imageUrl}" alt="${data.ign}" />
        <h3>${data.ign}</h3>
        <p>Drive Train: ${data.drivetrain}</p>
        <p>Clan Rank: ${data.clanRank}</p>
        <p>Player ID: ${data.playerId}</p>
        ${isOwner ? `<button class="delete-btn" data-id="${docSnap.id}">Delete</button>` : ""}
      `;
      container.appendChild(card);
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        if (confirm("Delete this player?")) {
          await deleteDoc(doc(db, "players", id));
          loadPlayers();
        }
      });
    });
  }

  // Admin Emails
  function isAdmin(email) {
    const admins = ["admin@example.com", "youremail@gmail.com"];
    return admins.includes(email);
  }

  onAuthStateChanged(auth, (user) => {
    const rightNav = document.querySelector(".right-nav");
    if (user) {
      rightNav.innerHTML = `<span>Welcome, ${user.email}</span> <button id="logoutBtn" class="upload-btn">Logout</button>`;
      document.getElementById("logoutBtn").addEventListener("click", () => {
        signOut(auth);
      });
      loadPlayers();
    } else {
      rightNav.innerHTML = `<button id="loginBtn" class="upload-btn">LOGIN</button>`;
      document.getElementById("loginBtn").addEventListener("click", () => {
        loginModal.style.display = "flex";
      });
    }
  });
});
