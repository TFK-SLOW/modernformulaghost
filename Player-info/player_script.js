// Modal handlers
const loginModal = document.getElementById("loginModal");
const loginBtn = document.getElementById("loginBtn");
const closeLogin = document.querySelector("#loginModal .close");

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
