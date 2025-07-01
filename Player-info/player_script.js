// player_script.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://kutsenbuwxhyzldcmiog.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1dHNlbmJ1d3hoeXpsZGNtaW9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyNjk5NjIsImV4cCI6MjA2Njg0NTk2Mn0.dFYSvzCKmkD0B1QQWJHQw6dV__uUtVjZOX6UEGEu3J8'; // Truncated for safety
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const uploadBtn = document.getElementById("uploadBtn");
const modal = document.getElementById("uploadModal");
const closeBtn = document.querySelector(".close");

uploadBtn.onclick = () => modal.style.display = "block";
closeBtn.onclick = () => modal.style.display = "none";
window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };

document.getElementById("playerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const ign = document.getElementById("ign").value.trim();
  const drivetrain = document.getElementById("drivetrain").value.trim();
  const rank = document.getElementById("rank").value.trim();
  const playerId = document.getElementById("playerId").value.trim();
  const photoFile = document.getElementById("photo").files[0];

  if (!photoFile) return alert("Please upload a player image.");

  const ext = photoFile.name.split('.').pop();
  const fileName = `${Date.now()}_${ign.replace(/\s+/g, "_")}.${ext}`;
  const filePath = `players/${fileName}`;

  const { error: uploadError } = await db.storage.from('players').upload(filePath, photoFile);
  if (uploadError) return alert("Image upload failed: " + uploadError.message);

  const { data: publicUrlData } = db.storage.from('players').getPublicUrl(filePath);
  const photoURL = publicUrlData.publicUrl;

  const { error: insertError } = await db.from('players').insert([
    { ign, drivetrain, rank, player_id: playerId, photo_url: photoURL }
  ]);

  if (insertError) return alert("Save failed: " + insertError.message);

  alert("Player uploaded!");
  document.getElementById("playerForm").reset();
  modal.style.display = "none";
  loadPlayers();
});

export async function loadPlayers() {
  const container = document.getElementById("playerContainer");
  container.innerHTML = "";

  const { data, error } = await db.from('players').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error("Load Error:", error);
    container.innerHTML = "<p>Failed to load players.</p>";
    return;
  }

  data.forEach(player => {
    const card = document.createElement("div");
    card.className = "player-card";
    card.innerHTML = `
      <div class="player-img"><img src="${player.photo_url}" alt="Player" /></div>
      <div class="player-info">
        <h3>IGN: ${player.ign}</h3>
        <p>Drive Train: ${player.drivetrain}</p>
        <p>Clan Rank: ${player.rank}</p>
        <p>Player ID: ${player.player_id}</p>
        <button class="delete-btn" data-id="${player.id}" data-img="${player.photo_url}">Delete</button>
      </div>
    `;
    container.appendChild(card);
  });
}

// Call after page load
window.addEventListener("DOMContentLoaded", loadPlayers);

// Search
const searchInput = document.getElementById("searchInput");
if (searchInput) {
  searchInput.addEventListener("input", function () {
    const query = this.value.toLowerCase();
    document.querySelectorAll(".player-card").forEach(card => {
      card.style.display = card.textContent.toLowerCase().includes(query) ? "flex" : "none";
    });
  });
}

// Delegate click event to delete buttons
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const playerId = e.target.dataset.id;
    const imgUrl = e.target.dataset.img;
    const filePath = imgUrl.split("/").slice(-1)[0]; // extract filename

    // Confirm delete
    if (!confirm("Are you sure you want to delete this player?")) return;

    // Delete from DB
    const { error: dbError } = await db.from("players").delete().eq("id", playerId);
    if (dbError) return alert("Database delete error: " + dbError.message);

    // Delete image from storage
    const { error: storageError } = await db.storage.from("players").remove([`players/${filePath}`]);
    if (storageError) return alert("Image delete error: " + storageError.message);

    alert("Player deleted!");
    loadPlayers(); // refresh UI
  }
});

