// Modal handlers
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
  if (e.target === loginModal) {
    loginModal.style.display = "none";
  }
});

// Firebase setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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

// Auth Handlers
const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginError = document.getElementById("loginError");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = loginEmail.value;
  const password = loginPassword.value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      loginModal.style.display = "none";
      loginForm.reset();
      loginError.textContent = "";
    })
    .catch((error) => {
      loginError.textContent = error.message;
    });
});

// Auth state observer
const rightNav = document.querySelector(".right-nav");
onAuthStateChanged(auth, (user) => {
  if (user) {
    rightNav.innerHTML = `<span>Welcome, ${user.email}</span> <button id="logoutBtn" class="upload-btn">Logout</button>`;

    document.getElementById("logoutBtn").addEventListener("click", () => {
      signOut(auth);
    });
  } else {
    rightNav.innerHTML = `<button id="loginBtn" class="upload-btn">LOGIN</button>`;
    document.getElementById("loginBtn").addEventListener("click", () => {
      loginModal.style.display = "flex";
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  // Modal elements
  const uploadModal = document.getElementById("uploadModal");
  const uploadBtn = document.getElementById("uploadBtn");
  const closeUpload = document.getElementById("closeUpload");
  const uploadForm = document.getElementById("uploadForm");

  // Show upload modal (only if logged in)
  uploadBtn.addEventListener("click", () => {
    if (firebase.auth().currentUser) {
      uploadModal.style.display = "flex";
    } else {
      alert("You must be logged in to upload a player.");
    }
  });

  // Close modal
  closeUpload.addEventListener("click", () => {
    uploadModal.style.display = "none";
  });

  // Close when clicking outside modal
  window.addEventListener("click", (e) => {
    if (e.target === uploadModal) {
      uploadModal.style.display = "none";
    }
  });

  // Handle form submission
  uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = firebase.auth().currentUser;
    if (!user) return alert("You must be logged in to upload.");

    const ign = document.getElementById("ign").value;
    const drivetrain = document.getElementById("drivetrain").value;
    const clanRank = document.getElementById("clanRank").value;
    const playerId = document.getElementById("playerId").value;
    const imageFile = document.getElementById("playerImage").files[0];

    if (!imageFile) return alert("Please select an image.");

    const imageRef = firebase.storage().ref().child(`players/${Date.now()}_${imageFile.name}`);
    await imageRef.put(imageFile);
    const imageUrl = await imageRef.getDownloadURL();

    await firebase.firestore().collection("players").add({
      ign,
      drivetrain,
      clanRank,
      playerId,
      imageUrl,
      uid: user.uid,
      email: user.email,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    alert("Player uploaded successfully!");
    uploadForm.reset();
    uploadModal.style.display = "none";
    loadPlayers(); // Refresh cards
  });

  // Load and display all players
  async function loadPlayers() {
    const container = document.getElementById("playerContainer");
    container.innerHTML = "";
    const user = firebase.auth().currentUser;

    const querySnapshot = await firebase.firestore()
      .collection("players")
      .orderBy("timestamp", "desc")
      .get();

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const isOwner = user && (user.uid === data.uid || isAdmin(user.email));

      const card = document.createElement("div");
      card.className = "player-card";
      card.innerHTML = `
        <img src="${data.imageUrl}" alt="${data.ign}" />
        <h3>${data.ign}</h3>
        <p>Drive Train: ${data.drivetrain}</p>
        <p>Clan Rank: ${data.clanRank}</p>
        <p>Player ID: ${data.playerId}</p>
        ${isOwner ? `<button class="delete-btn" data-id="${doc.id}">Delete</button>` : ""}
      `;
      container.appendChild(card);
    });

    // Add delete button functionality
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        if (confirm("Are you sure you want to delete this player?")) {
          await firebase.firestore().collection("players").doc(id).delete();
          loadPlayers();
        }
      });
    });
  }

  // Auto-refresh when user logs in
  firebase.auth().onAuthStateChanged((user) => {
    if (user) loadPlayers();
  });

  // Simple admin check (replace with real admin logic)
  function isAdmin(email) {
    const adminEmails = ["admin@example.com", "youremail@gmail.com"]; // Add your admin emails
    return adminEmails.includes(email);
  }
});
