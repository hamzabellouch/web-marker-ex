// Web Marker - Background Service Worker

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Set initial configuration
    await chrome.storage.local.set({
      markerSettings: {
        enabled: true,
        defaultColor: '#ffff54', // Vibrant yellow by default
        defaultTextColor: '#111827',
        palettePresets: [
          '#ffff54', '#ff9f2e', '#70e797', '#f472b6', '#a78bfa', '#38bdf8',
          '#fef08a', '#fed7aa', '#bbf7d0', '#fbcfe8', '#e9d5ff', '#bae6fd'
        ]
      }
    });
  }
});

// Handle keyboard shortcuts (Alt+S)
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle-highlight') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id && tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('about:') && !tab.url.startsWith('edge://')) {
      try {
        await chrome.tabs.sendMessage(tab.id, { action: 'TRIGGER_KEYBOARD_HIGHLIGHT' });
      } catch (err) {
        // Tab may not have content script loaded yet
        console.warn('Could not send shortcut to tab:', err);
      }
    }
  }
});
