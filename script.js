// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDKjvERjZEGVOkcBtlduUZFA6kRk6k-B18",
  authDomain: "modern-formula-ghost.firebaseapp.com",
  projectId: "modern-formula-ghost",
  appId: "1:456424596100:web:556a3eeb39d8329aca98d1",
  measurementId: "G-JHDBDZ1YZ6"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const ADMIN_EMAILS = ["kz.guira08@gmail.com"];
let currentUser = null;

// Ensure modals are hidden on page load
document.addEventListener("DOMContentLoaded", () => {
  ["loginModal", "signupModal", "uploadModal"].forEach(id => {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = "none";
  });

  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("nav-links");

  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });

  // Collapse hamburger when any nav button or link is clicked
  document.querySelectorAll("#nav-links a, #nav-links button").forEach(el => {
    el.addEventListener("click", () => {
      navLinks.classList.remove("open");
    });
  });
});

// Monitor auth state
auth.onAuthStateChanged(user => {
  currentUser = user;
  const logoutBtn = document.querySelector(".logout-btn");
  const loginBtn = document.querySelector(".login-btn");

  if (user) {
    console.log("Logged in as:", user.email);
    if (logoutBtn) logoutBtn.style.display = "inline-block";
    if (loginBtn) loginBtn.style.display = "none";
  } else {
    console.log("Not logged in");
    if (logoutBtn) logoutBtn.style.display = "none";
    if (loginBtn) loginBtn.style.display = "inline-block";
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
  document.getElementById("loginModal").style.display = "flex";
  closeSignupModal();
}

function closeLoginModal() {
  document.getElementById("loginModal").style.display = "none";
}

function showSignup() {
  closeLoginModal();
  document.getElementById("signupModal").style.display = "flex";
}

function closeSignupModal() {
  document.getElementById("signupModal").style.display = "none";
}

// Close modal when clicking outside
window.addEventListener("click", function (event) {
  const loginModal = document.getElementById("loginModal");
  const signupModal = document.getElementById("signupModal");
  const uploadModal = document.getElementById("uploadModal");
  if (event.target === loginModal) loginModal.style.display = "none";
  if (event.target === signupModal) signupModal.style.display = "none";
  if (event.target === uploadModal) uploadModal.style.display = "none";
});

// Upload Modal control with auth check
function openModal() {
  if (!currentUser) {
    openLoginModal();
    return;
  }
  document.getElementById("uploadModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("uploadModal").style.display = "none";
}

// Upload post
function submitPost() {
  if (!currentUser) {
    alert("Please log in to post.");
    openLoginModal();
    return;
  }

  const caption = document.getElementById("caption").value.trim();
  const file = document.getElementById("imageUpload").files[0];

  if (!caption || !file) {
    alert("Please fill in all fields and select an image.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function () {
    const base64Image = reader.result.split(',')[1];

    fetch("https://api.imgur.com/3/image", {
      method: "POST",
      headers: {
        Authorization: `Client-ID 7f74d5298224982`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        image: base64Image,
        type: "base64"
      })
    })
    .then(res => res.json())
    .then(data => {
      const imageUrl = data.data.link;
      displayImage(imageUrl);
    
      const nameInput = document.getElementById("name").value.trim();
    
      return db.collection("posts").add({
        name: nameInput || currentUser.email, // ✅ Uses input value, fallback to email
        caption,
        image: imageUrl,
        createdAt: new Date(),
        uid: currentUser.uid
      });
    })
    .then(() => {
      alert("Post uploaded!");
      closeModal();
      location.reload();
    })
    .catch(err => {
      console.error("Upload failed:", err);
      alert("Imgur upload failed.");
    });
  };
  reader.readAsDataURL(file);
}

const preview = document.getElementById('preview');

// When your Imgur upload returns the URL:
function displayImage(imgUrl) {
  preview.innerHTML = `<img src="${imgUrl}" alt="Uploaded image">`;
}

// Reset password
function resetPassword() {
  const email = document.getElementById("loginEmail").value.trim();

  if (!email) {
    alert("Please enter your email address first.");
    return;
  }

  auth.sendPasswordResetEmail(email)
    .then(() => {
      alert("Password reset email sent. Please check your inbox.");
    })
    .catch(error => {
      alert(error.message);
    });
}

// Load posts from Firestore and show them on the page
// Load posts from Firestore and show them on the page
function loadPosts() {
  db.collection("posts")
    .orderBy("createdAt", "desc")
    .get()
    .then(snapshot => {
      const feed = document.getElementById("feed");
      feed.innerHTML = ""; // Clear old content

      snapshot.forEach(doc => {
        const post = doc.data();
        const postDiv = document.createElement("div");
        postDiv.classList.add("feed-post");

        const canDelete = currentUser &&
          (currentUser.uid === post.uid || ADMIN_EMAILS.includes(currentUser.email));

        postDiv.innerHTML = `
          <p><strong>${post.name}</strong></p>
          <p>${post.caption}</p>
          <img src="${post.image}" alt="User post" />
          ${canDelete ? `<button class="delete-btn" data-id="${doc.id}">Delete</button>` : ""}
        `;

        feed.appendChild(postDiv);

        // Handle delete button click
        const deleteBtn = postDiv.querySelector(".delete-btn");
        if (deleteBtn) {
          deleteBtn.addEventListener("click", () => {
            if (confirm("Are you sure you want to delete this post?")) {
              db.collection("posts").doc(doc.id).delete().then(() => {
                alert("Post deleted.");
                loadPosts(); // Refresh the feed
              });
            }
          });
        }
      });
    });
}

document.addEventListener("DOMContentLoaded", () => {
  loadPosts(); // Load all saved posts on page load
});
