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


  console.log('Command received:', command);
  
  if (command === 'toggle-side-panel') {

    try {
      // Chrome doesn't allow sidePanel.open() from keyboard shortcuts
      // Instead, we'll highlight the extension icon and show a badge
      console.log('Keyboard shortcut triggered - highlighting extension icon');

      // Animate the extension icon to draw attention
      chrome.action.setBadgeText({ text: 'Click!' });
      chrome.action.setBadgeBackgroundColor({ color: '#4285f4' });
      chrome.action.setTitle({ title: 'SideClip 아이콘을 클릭하여 클립보드 히스토리를 여세요' });
      
      // Clear the badge after 5 seconds
      setTimeout(() => {
        chrome.action.setBadgeText({ text: '' });
        chrome.action.setTitle({ title: 'Open SideClip' });
      }, 5000);
      
    } catch (error) {
      console.error('Error handling keyboard shortcut:', error);
    }
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  try {
    // Clear any notification badges and reset title
    chrome.action.setBadgeText({ text: '' });
    chrome.action.setTitle({ title: 'Open SideClip' });
    
    // Open side panel for the clicked tab directly
    await chrome.sidePanel.open({ tabId: tab.id });
    console.log('Side panel opened successfully from icon click');
  } catch (error) {
    console.error('Error opening side panel from action click:', error);
    
    // Fallback: ensure side panel is properly configured
    try {
      await chrome.sidePanel.setOptions({
        tabId: tab.id,
        path: 'sidepanel.html',
        enabled: true
      });
      console.log('Side panel options set, trying to open again');
      await chrome.sidePanel.open({ tabId: tab.id });
    } catch (fallbackError) {
      console.error('Fallback failed:', fallbackError);
    }
  }
});

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
