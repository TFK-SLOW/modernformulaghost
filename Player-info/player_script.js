import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase config
const SUPABASE_URL = 'https://kutsenbuwxhyzldcmiog.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1dHNlbmJ1d3hoeXpsZGNtaW9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyNjk5NjIsImV4cCI6MjA2Njg0NTk2Mn0.dFYSvzCKmkD0B1QQWJHQw6dV__uUtVjZOX6UEGEu3J8';
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Modal controls
const uploadBtn = document.getElementById("uploadBtn");
const modal = document.getElementById("uploadModal");
const closeBtn = document.querySelector(".close");

uploadBtn.onclick = () => modal.style.display = "block";
closeBtn.onclick = () => modal.style.display = "none";
window.onclick = e => { if (e.target === modal) modal.style.display = "none"; };

// Form submission
document.getElementById("playerForm").addEventListener("submit", async e => {
  e.preventDefault();

  const ign = document.getElementById("ign").value.trim();
  const drivetrain = document.getElementById("drivetrain").value.trim();
  const rank = document.getElementById("rank").value.trim();
  const playerId = document.getElementById("playerId").value.trim();
  const photoFile = document.getElementById("photo").files[0];

  if (!ign || !drivetrain || !rank || !playerId || !photoFile) {
    return alert("Please fill all fields and upload a player image.");
  }

  const ext = photoFile.name.split('.').pop();
  const fileName = `${Date.now()}_${ign.replace(/\s+/g,'_')}.${ext}`;
  const filePath = `players/${fileName}`;

  const { error: uploadError } = await db.storage.from('players').upload(filePath, photoFile);
  if (uploadError) {
    console.error("Upload error:", uploadError);
    return alert("Image upload failed: " + uploadError.message);
  }

  const { data: urlData } = db.storage.from('players').getPublicUrl(filePath);
  const photoURL = urlData.publicUrl;

  const { error: insertError } = await db.from('players').insert([{ ign, drivetrain, rank, player_id: playerId, photo_url: photoURL }]);
  if (insertError) {
    console.error("Insert error:", insertError);
    return alert("Save failed: " + insertError.message);
  }

  alert("Player uploaded!");
  document.getElementById("playerForm").reset();
  modal.style.display = "none";
  loadPlayers();
});

// Load players
async function loadPlayers() {
  const container = document.getElementById("playerContainer");
  container.innerHTML = "";

  const { data, error } = await db.from('players').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error("Load error:", error);
    container.innerHTML = "<p>Failed to load players.</p>";
    return;
  }

  console.log("Loaded players:", data);

  data.forEach(player => {
    const card = document.createElement("div");
    card.className = "player-card";
    card.innerHTML = `
      <div class="player-img"><img src="${player.photo_url}" alt="Player image"></div>
      <div class="player-info">
        <h3>IGN: ${player.ign}</h3>
        <p>Drive Train: ${player.drivetrain}</p>
        <p>Clan Rank: ${player.rank}</p>
        <p>Player ID: ${player.player_id}</p>
      </div>`;
    container.appendChild(card);
  });
}

// Search
document.getElementById("searchInput").addEventListener("input", function() {
  const q = this.value.toLowerCase();
  document.querySelectorAll(".player-card").forEach(card => {
    card.style.display = card.textContent.toLowerCase().includes(q) ? "flex" : "none";
  });
});

// Initial load
console.log("Loaded players:", data);
loadPlayers();
