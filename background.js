// Background service worker for SideClip
console.log('SideClip background service worker loaded');

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('SideClip extension installed');
  
  // Initialize storage if needed
  chrome.storage.local.get(['clipboardHistory'], (result) => {
    if (!result.clipboardHistory) {
      chrome.storage.local.set({ clipboardHistory: [] });
    }
  });
  
  // Set default side panel behavior
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => {
    console.error('Error setting panel behavior:', error);
  });
});

// Handle keyboard shortcut command
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle-side-panel') {
    try {
      // Get the current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab) {
        console.error('No active tab found for keyboard shortcut');
        return;
      }
      
      // Direct call for keyboard shortcuts (user gesture preserved)
      await chrome.sidePanel.open({ tabId: tab.id });
    } catch (error) {
      console.error('Error opening side panel from keyboard shortcut:', error);
      
      // Alternative approach: ensure side panel is enabled and try again
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        await chrome.sidePanel.setOptions({
          tabId: tab.id,
          path: 'sidepanel.html',
          enabled: true
        });
        // Small delay and retry
        setTimeout(async () => {
          try {
            await chrome.sidePanel.open({ tabId: tab.id });
          } catch (retryError) {
            console.error('Retry failed:', retryError);
          }
        }, 100);
      } catch (fallbackError) {
        console.error('Keyboard shortcut fallback failed:', fallbackError);
      }
    }
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  try {
    // Open side panel for the clicked tab directly
    await chrome.sidePanel.open({ tabId: tab.id });
  } catch (error) {
    console.error('Error opening side panel from action click:', error);
  }
});

// Function to toggle side panel (for keyboard shortcuts)
async function toggleSidePanel() {
  try {
    // Get the current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      console.error('No active tab found');
      return;
    }
    
    // Open side panel for the current tab
    await chrome.sidePanel.open({ tabId: tab.id });
  } catch (error) {
    console.error('Error toggling side panel:', error);
    
    // Fallback: try to set the side panel path if opening fails
    try {
      await chrome.sidePanel.setOptions({
        tabId: tab?.id,
        path: 'sidepanel.html',
        enabled: true
      });
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
    }
  }
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TEXT_COPIED') {
    handleTextCopied(message.text);
  }
});

// Handle text copied from content script
async function handleTextCopied(text) {
  try {
    // Don't store empty text
    if (!text || text.trim().length === 0) {
      return;
    }
    
    // Get current clipboard history
    const result = await chrome.storage.local.get(['clipboardHistory']);
    let history = result.clipboardHistory || [];
    
    // Remove duplicate if exists (to avoid duplicates when moving to top)
    history = history.filter(item => item.text !== text);
    
    // Add new item to the beginning with timestamp
    const newItem = {
      id: Date.now().toString(),
      text: text,
      timestamp: new Date().toISOString(),
      preview: text.length > 100 ? text.substring(0, 100) + '...' : text
    };
    
    history.unshift(newItem);
    
    // Limit history to 50 items for performance
    if (history.length > 50) {
      history = history.slice(0, 50);
    }
    
    // Save updated history
    await chrome.storage.local.set({ clipboardHistory: history });
    
    console.log('Text added to clipboard history:', newItem.preview);
  } catch (error) {
    console.error('Error handling copied text:', error);
  }
}
