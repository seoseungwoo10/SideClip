// Content script to capture copy events
console.log('SideClip content script loaded');

// Listen for copy events
document.addEventListener('copy', handleCopyEvent, true);

function handleCopyEvent(event) {
  try {
    // Get the copied text from clipboard
    const selection = window.getSelection();
    const copiedText = selection.toString();
    
    // If we have text and it's not just whitespace
    if (copiedText && copiedText.trim().length > 0) {
      // Send the copied text to background script
      chrome.runtime.sendMessage({
        type: 'TEXT_COPIED',
        text: copiedText.trim()
      });
    }
  } catch (error) {
    console.error('Error capturing copy event:', error);
  }
}

// Also listen for keyboard shortcuts
document.addEventListener('keydown', (event) => {
  // Detect Ctrl+C (or Cmd+C on Mac)
  if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
    // Small delay to ensure clipboard is updated
    setTimeout(() => {
      const selection = window.getSelection();
      const copiedText = selection.toString();
      
      if (copiedText && copiedText.trim().length > 0) {
        chrome.runtime.sendMessage({
          type: 'TEXT_COPIED',
          text: copiedText.trim()
        });
      }
    }, 100);
  }
});
