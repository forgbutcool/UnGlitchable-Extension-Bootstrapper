const defaultButtons = [
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

const REMOTE_UI_URL = "https://raw.githubusercontent.com/forgbutcool/UnGlitchable-Extension-Bootstrapper/refs/heads/main/popup.html";

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['cachedUI'], (result) => {
    if (result.cachedUI) {
      document.body.innerHTML = result.cachedUI;
      
      const newUpdateBtn = document.getElementById('fetch-update-btn');
      if (newUpdateBtn) {
        newUpdateBtn.addEventListener('click', fetchUpdate);
      }
    } else {
      renderButtons(defaultButtons);
      document.getElementById('fetch-update-btn').addEventListener('click', fetchUpdate);
    }
  });
});

// 2. Dynamic Button Generation
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

async function fetchUpdate() {
  const statusEl = document.getElementById('status-message');
  if (statusEl) statusEl.textContent = "Fetching update...";

  try {
    const response = await fetch(REMOTE_UI_URL);
    if (!response.ok) throw new Error("Failed to fetch UI");
    
    const htmlContent = await response.text();

    chrome.storage.local.set({ cachedUI: htmlContent }, () => {
      if (statusEl) statusEl.textContent = "Update successful! Reloading...";
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    });

  } catch (error) {
    console.error("Update failed:", error);
    if (statusEl) {
      statusEl.textContent = "Error fetching update.";
      statusEl.style.color = "#f44336";
    }
  }
}
