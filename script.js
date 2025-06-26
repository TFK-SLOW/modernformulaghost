// Firebase configuration (make sure this matches what's in your main HTML)
const firebaseConfig = {
  apiKey: "AIzaSyDKjvERjZEGVOkcBtlduUZFA6kRk6k-B18",
  authDomain: "modern-formula-ghost.firebaseapp.com",
  projectId: "modern-formula-ghost",
  appId: "1:456424596100:web:556a3eeb39d8329aca98d1",
  measurementId: "G-JHDBDZ1YZ6"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

const ADMIN_EMAILS = ["kz.guira08@gmail.com"];
let currentUser = null;

// Monitor authentication state
auth.onAuthStateChanged(user => {
  currentUser = user;
  if (user) {
    console.log("Logged in as:", user.email);
    document.querySelector("button[onclick='logout()']").style.display = "inline-block";
    document.querySelector("button[onclick='openLoginModal()']").style.display = "none";
  } else {
    console.log("Not logged in");
    document.querySelector("button[onclick='logout()']").style.display = "none";
    document.querySelector("button[onclick='openLoginModal()']").style.display = "inline-block";
  }
});

// Login
function login() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      alert("Logged in successfully!");
      closeLoginModal();
    })
    .catch(error => alert(error.message));
}

// Signup
function signup() {
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value.trim();

  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      alert("Signup successful!");
      closeSignupModal();
    })
    .catch(error => alert(error.message));
}

// Logout
function logout() {
  auth.signOut()
    .then(() => {
      alert("Logged out.");
    });
}

// Modal controls
function openLoginModal() {
  document.getElementById("loginModal").style.display = "block";
  closeSignupModal();
}

function closeLoginModal() {
  document.getElementById("loginModal").style.display = "none";
}

function showSignup() {
  closeLoginModal();
  document.getElementById("signupModal").style.display = "block";
}

function closeSignupModal() {
  document.getElementById("signupModal").style.display = "none";
}

// Close modal when clicking outside
window.addEventListener("click", function (event) {
  const loginModal = document.getElementById("loginModal");
  const signupModal = document.getElementById("signupModal");
  if (event.target === loginModal) loginModal.style.display = "none";
  if (event.target === signupModal) signupModal.style.display = "none";
});
