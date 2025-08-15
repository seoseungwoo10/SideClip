// Content script to capture copy events
console.log('SideClip content script loaded');

// Listen for copy events
document.addEventListener('copy', handleCopyEvent, true);

async function handleCopyEvent(event) {
  try {
    console.log('Copy event detected');
    
    // Check clipboard for images
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const clipboardItem of clipboardItems) {
        // Check for images first
        for (const type of clipboardItem.types) {
          if (type.startsWith('image/')) {
            console.log('Image detected in clipboard:', type);
            const blob = await clipboardItem.getType(type);
            const reader = new FileReader();
            reader.onload = function(event) {
              chrome.runtime.sendMessage({
                type: 'IMAGE_COPIED',
                imageData: event.target.result,
                mimeType: type
              }, () => {
                // Don't wait for response
                if (chrome.runtime.lastError) {
                  console.log('Image message send failed:', chrome.runtime.lastError.message);
                }
              });
            };
            reader.readAsDataURL(blob);
            return; // Exit early if image found
          }
        }
      }
    } catch (clipboardError) {
      console.log('Clipboard API not available or failed:', clipboardError.message);
    }
    
    // Fallback to text detection
    setTimeout(() => {
      // Use selection method (more reliable)
      const selection = window.getSelection();
      const copiedText = selection.toString();
      
      // If we have text and it's not just whitespace
      if (copiedText && copiedText.trim().length > 0) {
        console.log('Selection text captured:', copiedText.substring(0, 50) + '...');
        // Send the copied text to background script
        chrome.runtime.sendMessage({
          type: 'TEXT_COPIED',
          text: copiedText.trim()
        }, () => {
          // Don't wait for response
          if (chrome.runtime.lastError) {
            console.log('Text message send failed:', chrome.runtime.lastError.message);
          }
        });
      } else {
        console.log('No text found in selection');
      }
    }, 50);
  } catch (error) {
    console.error('Error capturing copy event:', error);
  }
}

// Also listen for keyboard shortcuts
document.addEventListener('keydown', async (event) => {
  // Detect Ctrl+C (or Cmd+C on Mac)
  if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
    console.log('Ctrl+C detected');
    
    // Check clipboard for images first
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const clipboardItem of clipboardItems) {
        // Check for images first
        for (const type of clipboardItem.types) {
          if (type.startsWith('image/')) {
            console.log('Image detected in clipboard via keyboard:', type);
            const blob = await clipboardItem.getType(type);
            const reader = new FileReader();
            reader.onload = function(event) {
              chrome.runtime.sendMessage({
                type: 'IMAGE_COPIED',
                imageData: event.target.result,
                mimeType: type
              }, () => {
                // Don't wait for response
                if (chrome.runtime.lastError) {
                  console.log('Keyboard image message send failed:', chrome.runtime.lastError.message);
                }
              });
            };
            reader.readAsDataURL(blob);
            return; // Exit early if image found
          }
        }
      }
    } catch (clipboardError) {
      console.log('Keyboard: Clipboard API not available or failed:', clipboardError.message);
    }
    
    // Fallback to text detection
    setTimeout(() => {
      // Use selection method
      const selection = window.getSelection();
      const copiedText = selection.toString();
      
      if (copiedText && copiedText.trim().length > 0) {
        console.log('Keyboard shortcut - Selection text captured:', copiedText.substring(0, 50) + '...');
        chrome.runtime.sendMessage({
          type: 'TEXT_COPIED',
          text: copiedText.trim()
        }, () => {
          // Don't wait for response
          if (chrome.runtime.lastError) {
            console.log('Keyboard text message send failed:', chrome.runtime.lastError.message);
          }
        });
      } else {
        console.log('Keyboard shortcut - No text found in selection');
      }
    }, 100);
  }
});
