const DEFAULT_VERSION = "1.0.0";
const DEFAULT_BUTTONS = [
  { 
    label: "Main Folder", 
    url: "https://drive.google.com/drive/folders/1u8e8e_SkOG9VhwM-mt209pSgi-yXShx8?usp=sharing" 
  },
  { 
    label: "WEAO Quick Opener (v1)", 
    url: "https://drive.google.com/drive/folders/1h27behhKFxXaN67WRsW0YtuJ-hadvc7B?usp=sharing" 
  },
  { 
    label: "Discord Web hook Sender (v1)", 
    url: "https://drive.google.com/drive/folders/1E0lTRJq5Aj03t1MsKDfUrzq80T9ZxygH?usp=sharing" 
  },
  { 
    label: "Discord Emoji Opener (v1)", 
    url: "https://drive.google.com/drive/folders/1I_NzS7pLxD9EggXzOQYDb8eTkzD_1qsk?usp=sharing" 
  }
];

const VERSION_URL = "https://raw.githubusercontent.com/forgbutcool/UnGlitchable-Extension-Bootstrapper/refs/heads/main/version.json";
const REMOTE_JS_URL = "https://raw.githubusercontent.com/forgbutcool/UnGlitchable-Extension-Bootstrapper/refs/heads/main/popup.js";

let currentLocalVersion = DEFAULT_VERSION;
let targetRemoteVersion = DEFAULT_VERSION;

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['cachedVersion', 'cachedButtons'], (result) => {
    currentLocalVersion = result.cachedVersion || DEFAULT_VERSION;
    const activeButtons = result.cachedButtons || DEFAULT_BUTTONS;

    renderButtons(activeButtons);
    updateVersionFooter(currentLocalVersion, false);
    
    const updateBtn = document.getElementById('fetch-update-btn');
    updateBtn.addEventListener('click', handleUpdateLifecycle);

    checkRemoteVersion();
  });
});

function renderButtons(buttonData) {
  const container = document.getElementById('button-container');
  container.innerHTML = ''; 

  buttonData.forEach(btn => {
    const buttonElement = document.createElement('button');
    buttonElement.className = 'launch-btn';
    buttonElement.textContent = btn.label;
    
    buttonElement.addEventListener('click', () => {
      chrome.tabs.create({ url: btn.url });
    });

    container.appendChild(buttonElement);
  });
}

async function checkRemoteVersion() {
  try {
    const response = await fetch(VERSION_URL);
    if (!response.ok) throw new Error("Version fetch failed");
    
    const data = await response.json();
    targetRemoteVersion = data.version;

    const updateBtn = document.getElementById('fetch-update-btn');

    if (currentLocalVersion !== targetRemoteVersion) {
      updateBtn.disabled = false;
      updateBtn.classList.remove('disabled');
      updateVersionFooter(currentLocalVersion, true);
    } else {
      updateBtn.disabled = true;
      updateBtn.classList.add('disabled');
      updateVersionFooter(currentLocalVersion, false);
    }
  } catch (error) {
    console.error("Failed to parse remote version validation metadata:", error);
  }
}

async function handleUpdateLifecycle() {
  const statusEl = document.getElementById('status-message');
  const updateBtn = document.getElementById('fetch-update-btn');
  
  statusEl.textContent = "Fetching update...";
  statusEl.style.color = "#4CAF50";
  updateBtn.disabled = true;

  try {
    const response = await fetch(REMOTE_JS_URL);
    if (!response.ok) throw new Error("Failed to pull updated module asset configurations.");
    
    const jsText = await response.text();
    const parsedButtons = extractButtonsSecurely(jsText);

    chrome.storage.local.set({ 
      cachedVersion: targetRemoteVersion, 
      cachedButtons: parsedButtons 
    }, () => {
      statusEl.textContent = "Update successful! Reloading...";
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    });

  } catch (error) {
    console.error("Update processing failure:", error);
    statusEl.textContent = "Error fetching update.";
    statusEl.style.color = "#f44336";
    updateBtn.disabled = false;
  }
}

function extractButtonsSecurely(text) {
  const startIdx = text.indexOf('[');
  const endIdx = text.lastIndexOf(']');
  if (startIdx === -1 || endIdx === -1) throw new Error("Invalid remote schema mapping syntax.");

  let arrayBody = text.substring(startIdx, endIdx + 1);

  arrayBody = arrayBody.replace(/([a-zA-Z0-9_]+)\s*:/g, '"$1":');
  arrayBody = arrayBody.replace(/,\s*([\]}])/g, '$1');

  return JSON.parse(arrayBody);
}

function updateVersionFooter(version, isOutdated) {
  const footer = document.getElementById('version-footer');
  if (isOutdated) {
    footer.textContent = `Version: ${version} (OUTDATED)`;
    footer.style.color = "#ff9800";
  } else {
    footer.textContent = `Version: ${version}`;
    footer.style.color = "rgba(255, 255, 255, 0.4)";
  }
}
