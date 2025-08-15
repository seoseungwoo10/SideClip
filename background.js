// Background service worker for SideClip
console.log('%c[SideClip Background] Service worker loaded at ' + new Date().toLocaleTimeString(), 'color: #28a745; font-weight: bold;');

// Import image database utility
importScripts('imageDB.js');

// Initialize image database
let imageDB = null;

// Enhanced logging function
function logBackground(message, data = null) {
  const timestamp = new Date().toLocaleTimeString();
  if (data) {
    console.log(`%c[SideClip Background ${timestamp}] ${message}`, 'color: #007bff;', data);
  } else {
    console.log(`%c[SideClip Background ${timestamp}] ${message}`, 'color: #007bff;');
  }
}

// Initialize image database
async function initImageDB() {
  if (!imageDB) {
    imageDB = new ClipboardImageDB();
    await imageDB.init();
  }
  return imageDB;
}

// Create context menus immediately when service worker starts
function createContextMenus() {
  try {
    chrome.contextMenus.removeAll(() => {
      chrome.contextMenus.create({
        id: 'copy-image-to-sideclip',
        title: '📋 SideClip에 이미지 복사',
        contexts: ['image'],
        visible: true
      }, () => {
        if (chrome.runtime.lastError) {
          console.error('Error creating context menu:', chrome.runtime.lastError);
        } else {
          console.log('Context menu created successfully');
        }
      });
    });
  } catch (error) {
    console.error('Error in createContextMenus:', error);
  }
}

// Create context menus immediately
createContextMenus();

// Handle extension installation
chrome.runtime.onInstalled.addListener(async () => {
  console.log('SideClip extension installed');
  
  // Initialize storage if needed
  chrome.storage.local.get(['clipboardHistory'], (result) => {
    if (!result.clipboardHistory) {
      chrome.storage.local.set({ clipboardHistory: [] });
    }
  });
  
  // Initialize image database
  await initImageDB();
  
  // Set default side panel behavior
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => {
    console.error('Error setting panel behavior:', error);
  });

  // Create context menu for images
  try {
    // Remove any existing context menus first
    chrome.contextMenus.removeAll(() => {
      // Create the image context menu
      chrome.contextMenus.create({
        id: 'copy-image-to-sideclip',
        title: '📋 SideClip에 이미지 복사',
        contexts: ['image'],
        visible: true
      }, () => {
        if (chrome.runtime.lastError) {
          console.error('Error creating context menu:', chrome.runtime.lastError);
        } else {
          console.log('Context menu created successfully');
        }
      });
    });
  } catch (error) {
    console.error('Error setting up context menu:', error);
  }
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
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {

  console.log("Message received:", message);

  if (message.type === 'TEXT_COPIED') {
    await handleTextCopied(message.text);
    sendResponse({ success: true });
  } else if (message.type === 'IMAGE_COPIED') {
    // Convert data URL to blob
    try {
      const response = await fetch(message.imageData);
      const blob = await response.blob();
      
      const imageData = {
        blob: blob,
        size: blob.size,
        type: message.mimeType || blob.type,
        url: sender.tab?.url || '',
        dataUrl: message.imageData
      };
      
      await handleImageCopied(imageData, sender.tab);
      sendResponse({ success: true });
    } catch (error) {
      console.error('Error processing image data:', error);
      sendResponse({ success: false, error: error.message });
    }
  } else if (message.type === 'GET_CLIPBOARD_DATA') {
    const data = await getClipboardData();
    sendResponse(data);
    return true; // Indicates async response
  } else if (message.type === 'DELETE_IMAGE') {
    await deleteImage(message.imageId);
    sendResponse({ success: true });
    return true;
  } else if (message.type === 'CLEAR_ALL_IMAGES') {
    await clearAllImages();
    sendResponse({ success: true });
    return true;
  }
  return true; // Keep message channel open for async response
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {

  logBackground("Context menu clicked:", info);

  if (info.menuItemId === 'copy-image-to-sideclip') {

    try {
      logBackground('Context menu clicked for image:', info.srcUrl);
      
      // Download image directly in background script (bypasses CORS)
      const imageData = await downloadImageInBackground(info.srcUrl);
      
      if (imageData.success) {
        await handleImageCopied(imageData, tab);
        
        // Show success badge
        chrome.action.setBadgeText({ text: '✓' });
        chrome.action.setBadgeBackgroundColor({ color: '#28a745' });
        setTimeout(() => {
          chrome.action.setBadgeText({ text: '' });
        }, 2000);
      } else {
        console.error('Failed to download image:', imageData.error);
        // Show error badge
        chrome.action.setBadgeText({ text: '✗' });
        chrome.action.setBadgeBackgroundColor({ color: '#dc3545' });
        setTimeout(() => {
          chrome.action.setBadgeText({ text: '' });
        }, 2000);
      }
    } catch (error) {
      console.error('Error in context menu handler:', error);
      // Show error badge
      chrome.action.setBadgeText({ text: '✗' });
      chrome.action.setBadgeBackgroundColor({ color: '#dc3545' });
      setTimeout(() => {
        chrome.action.setBadgeText({ text: '' });
      }, 2000);
    }
  }
});

// Download image directly in background script (bypasses CORS)
async function downloadImageInBackground(imageUrl) {

  try {
  
    logBackground('Starting image download:', imageUrl);
    
    // Use fetch with proper headers
    const response = await fetch(imageUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const blob = await response.blob();
    
    // Convert blob to data URL
    const reader = new FileReader();
    return new Promise((resolve) => {
      reader.onload = function() {
        // Service Worker cannot use Image constructor
        // We'll get dimensions later when the image is displayed
        resolve({
          success: true,
          blob: blob,
          size: blob.size,
          type: blob.type,
          url: imageUrl,
          dataUrl: reader.result,
          width: 0, // Will be determined in UI
          height: 0 // Will be determined in UI
        });
      };
      reader.onerror = function() {
        resolve({
          success: false,
          error: 'Failed to read blob as data URL'
        });
      };
      reader.readAsDataURL(blob);
    });
    
  } catch (error) {
    console.error('Error downloading image:', error);
    
    // Create placeholder image as fallback
    const canvas = new OffscreenCanvas(300, 200);
    const ctx = canvas.getContext('2d');
    
    // Draw placeholder
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, 300, 200);
    
    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, 298, 198);
    
    ctx.fillStyle = '#6c757d';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🖼️ 이미지 저장됨', 150, 90);
    ctx.fillText('(다운로드 실패)', 150, 115);
    
    const blob = await canvas.convertToBlob({ type: 'image/png' });
    
    const reader = new FileReader();
    return new Promise((resolve) => {
      reader.onload = function() {
        resolve({
          success: true,
          blob: blob,
          size: blob.size,
          type: blob.type,
          url: imageUrl,
          dataUrl: reader.result,
          isPlaceholder: true
        });
      };
      reader.readAsDataURL(blob);
    });
  }
}

// Handle text copied from content script
async function handleTextCopied(text) {
  try {
    console.log('handleTextCopied called with:', text);
    
    // Don't store empty text
    if (!text || text.trim().length === 0) {
      console.log('Empty text, skipping...');
      return;
    }
    
    // Get current clipboard history
    const result = await chrome.storage.local.get(['clipboardHistory']);
    let history = result.clipboardHistory || [];
    
    console.log('Current history length:', history.length);
    
    // Remove duplicate if exists (to avoid duplicates when moving to top)
    history = history.filter(item => item.text !== text);
    
    // Add new item to the beginning with timestamp
    const newItem = {
      id: Date.now().toString(),
      type: 'text',
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
    console.log('New history length:', history.length);
    
    // Verify the data was saved
    const verification = await chrome.storage.local.get(['clipboardHistory']);
    console.log('Verification - items in storage:', verification.clipboardHistory?.length || 0);
    
  } catch (error) {
    console.error('Error handling copied text:', error);
  }
}

// Handle image copied
async function handleImageCopied(imageData, tab) {
  try {
    if (!imageData || !imageData.blob) {
      console.error('Invalid image data received');
      return;
    }

    // Check image size (limit to 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (imageData.size > maxSize) {
      console.warn('Image too large, skipping:', imageData.size);
      return;
    }

    // Initialize image database if needed
    await initImageDB();

    // Store image in IndexedDB with enhanced error handling
    let imageRecord;
    try {
      imageRecord = await imageDB.storeImage({
        blob: imageData.blob,
        url: imageData.url || tab?.url || '',
        size: imageData.size,
        type: imageData.type
      });
      console.log('Image successfully stored in IndexedDB:', imageRecord.id);
    } catch (dbError) {
      console.error('Failed to store image in IndexedDB:', dbError);
      console.error('Image data details:', {
        hasBlob: !!imageData.blob,
        blobType: imageData.blob?.type,
        blobSize: imageData.blob?.size,
        dataType: imageData.type,
        dataSize: imageData.size
      });
      
      // Continue with storage.local fallback but log the failure
      logBackground('IndexedDB storage failed, continuing without database storage');
    }

    // Add to text history for unified timeline (continue even if DB storage failed)
    const result = await chrome.storage.local.get(['clipboardHistory']);
    let history = result.clipboardHistory || [];
    
    // Create fallback record if IndexedDB storage failed
    const recordId = imageRecord?.id || `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const recordTimestamp = imageRecord?.timestamp || new Date().toISOString();
    
    const newItem = {
      id: recordId,
      type: 'image',
      timestamp: recordTimestamp,
      preview: `이미지 (${formatFileSize(imageData.size)})`,
      imageId: imageRecord?.id || null,
      url: imageData.url,
      dataUrl: imageData.dataUrl,
      size: formatFileSize(imageData.size),
      originalSize: imageData.size,
      width: imageData.width || 'Unknown',
      height: imageData.height || 'Unknown'
    };
    
    logBackground('Created image item:', newItem);
    
    history.unshift(newItem);
    
    // Limit history to 50 items for performance
    if (history.length > 50) {
      history = history.slice(0, 50);
    }
    
    await chrome.storage.local.set({ clipboardHistory: history });
    
    // Clean old images if needed
    await imageDB.cleanOldImages(50);
    
    console.log('Image added to clipboard history:', imageRecord.id);
  } catch (error) {
    console.error('Error handling copied image:', error);
  }
}

// Get combined clipboard data (text + images)
async function getClipboardData() {
  try {
    logBackground('getClipboardData called');
    
    // Get text history
    const result = await chrome.storage.local.get(['clipboardHistory']);
    const textHistory = result.clipboardHistory || [];
    
    logBackground('Text history from storage:', textHistory.length + ' items');
    
    // Get image data for image items
    await initImageDB();
    const images = await imageDB.getAllImages();
    const imageMap = new Map(images.map(img => [img.id, img]));
    
    logBackground('Images from IndexedDB:', images.length + ' items');
    
    // Combine and sort by timestamp
    const combinedHistory = textHistory.map(item => {
      if (item.type === 'image' && imageMap.has(item.imageId)) {
        const imageData = imageMap.get(item.imageId);
        logBackground('Found image data for item:', item.id);
        return {
          ...item,
          dataUrl: imageData.dataUrl,
          size: formatFileSize(imageData.size || 0),
          originalSize: imageData.size
        };
      }
      return item;
    });
    
    logBackground('Returning combined history:', combinedHistory.length + ' items');
    return combinedHistory;
  } catch (error) {
    console.error('Error getting clipboard data:', error);
    return [];
  }
}

// Delete image
async function deleteImage(imageId) {
  try {
    await initImageDB();
    await imageDB.deleteImage(imageId);
    
    // Also remove from text history
    const result = await chrome.storage.local.get(['clipboardHistory']);
    let history = result.clipboardHistory || [];
    history = history.filter(item => item.id !== imageId);
    await chrome.storage.local.set({ clipboardHistory: history });
    
    console.log('Image deleted:', imageId);
  } catch (error) {
    console.error('Error deleting image:', error);
  }
}

// Clear all images
async function clearAllImages() {
  try {
    await initImageDB();
    await imageDB.clearAllImages();
    
    // Also clear from text history
    const result = await chrome.storage.local.get(['clipboardHistory']);
    let history = result.clipboardHistory || [];
    history = history.filter(item => item.type !== 'image');
    await chrome.storage.local.set({ clipboardHistory: history });
    
    console.log('All images cleared');
  } catch (error) {
    console.error('Error clearing images:', error);
  }
}

// Format file size for display
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
