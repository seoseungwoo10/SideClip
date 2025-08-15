// SideClip Side Panel JavaScript
console.log('SideClip side panel loaded');

// DOM elements
const emptyState = document.getElementById('emptyState');
const historyContainer = document.getElementById('historyContainer');
const historyList = document.getElementById('historyList');
const clearAllBtn = document.getElementById('clearAllBtn');
const confirmDialog = document.getElementById('confirmDialog');
const confirmClearBtn = document.getElementById('confirmClearBtn');
const cancelClearBtn = document.getElementById('cancelClearBtn');
const notification = document.getElementById('notification');

// Load clipboard history when panel opens
document.addEventListener('DOMContentLoaded', loadClipboardHistory);

// Event listeners
clearAllBtn.addEventListener('click', showClearAllDialog);
confirmClearBtn.addEventListener('click', clearAllHistory);
cancelClearBtn.addEventListener('click', hideClearAllDialog);

// Load and display clipboard history
async function loadClipboardHistory() {
    try {
        console.log('Loading clipboard history...');
        
        // Try to get data directly from storage first
        const result = await chrome.storage.local.get(['clipboardHistory']);
        const directHistory = result.clipboardHistory || [];
        console.log('Direct storage result:', directHistory.length, 'items');
        
        if (directHistory.length > 0) {
            console.log('Using direct storage data');
            displayHistory(directHistory);
        } else {
            console.log('No direct storage data, trying message approach');
            // Get combined clipboard data (text + images) via message
            const response = await chrome.runtime.sendMessage({ type: 'GET_CLIPBOARD_DATA' });
            const history = response || [];
            
            console.log('Received clipboard data via message:', history.length, 'items');
            displayHistory(history);
        }
        
        // Listen for storage changes to update UI in real-time
        chrome.storage.onChanged.addListener(async (changes, namespace) => {
            if (namespace === 'local' && changes.clipboardHistory) {
                console.log('Storage changed, reloading...');
                const newValue = changes.clipboardHistory.newValue || [];
                console.log('New storage value:', newValue.length, 'items');
                displayHistory(newValue);
            }
        });
    } catch (error) {
        console.error('Error loading clipboard history:', error);
        // Show empty state on error
        displayHistory([]);
    }
}

// Display history in the UI
function displayHistory(history) {
    console.log('displayHistory called with:', history);
    
    // Clear current list
    historyList.innerHTML = '';
    
    if (!history || history.length === 0) {
        console.log('No history items, showing empty state');
        emptyState.classList.remove('hidden');
        historyContainer.classList.add('hidden');
        return;
    }
    
    console.log('Displaying', history.length, 'history items');
    emptyState.classList.add('hidden');
    historyContainer.classList.remove('hidden');
    
    // Create list items
    history.forEach((item, index) => {
        console.log('Creating item', index, ':', item);
        const listItem = createHistoryItem(item, index);
        historyList.appendChild(listItem);
    });
    
    console.log('All items added to DOM');
}

// Create a single history item element
function createHistoryItem(item, index) {
    console.log('Creating history item:', item);
    
    const li = document.createElement('li');
    li.className = `history-item ${item.type === 'image' ? 'image-item' : 'text-item'}`;
    li.setAttribute('data-id', item.id);
    
    // Format timestamp
    const timeAgo = getTimeAgo(new Date(item.timestamp));
    
    if (item.type === 'image') {
        // Create image item
        li.innerHTML = `
            <div class="item-content">
                <div class="image-content">
                    <div class="image-thumbnail-container">
                        <img src="${item.dataUrl}" alt="Copied image" class="image-thumbnail" />
                        <div class="image-overlay">
                            <span class="image-type-indicator">🖼️</span>
                        </div>
                    </div>
                    <div class="image-info">
                        <div class="item-text" id="size-${item.id}">${item.size || 'Loading...'}</div>
                        <div class="item-timestamp">${timeAgo}</div>
                        <div class="image-dimensions" id="dimensions-${item.id}"></div>
                    </div>
                </div>
            </div>
            <button class="delete-btn" title="Delete this item">×</button>
        `;
        
        // Add click handler for copying image
        const itemContent = li.querySelector('.item-content');
        itemContent.addEventListener('click', () => copyImageToClipboard(item));
        
        // Update image info when loaded
        const img = li.querySelector('img');
        img.onload = function() {
            updateImageInfo(this, item);
        };
    } else {
        // Create text item
        li.innerHTML = `
            <div class="item-content">
                <div class="text-indicator">📝</div>
                <div class="text-content">
                    <div class="item-text">${escapeHtml(item.preview || item.text)}</div>
                    <div class="item-timestamp">${timeAgo}</div>
                </div>
            </div>
            <button class="delete-btn" title="Delete this item">×</button>
        `;
        
        // Add click handler for copying text
        const itemContent = li.querySelector('.item-content');
        itemContent.addEventListener('click', () => copyTextToClipboard(item.text));
    }
    
    // Add click handler for delete button
    const deleteBtn = li.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await deleteHistoryItem(item.id);
    });
    
    return li;
}

// Update image info when image is loaded
function updateImageInfo(imgElement, item) {
    try {
        const sizeElement = document.getElementById(`size-${item.id}`);
        const dimensionsElement = document.getElementById(`dimensions-${item.id}`);
        
        if (sizeElement && item.originalSize) {
            const fileSize = formatFileSize(item.originalSize);
            sizeElement.textContent = fileSize;
        }
        
        if (dimensionsElement) {
            const dimensions = `${imgElement.naturalWidth} × ${imgElement.naturalHeight}`;
            dimensionsElement.textContent = dimensions;
        }
    } catch (error) {
        console.error('Error updating image info:', error);
    }
}

// Format file size
function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return 'Unknown size';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Copy text to clipboard
async function copyTextToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('텍스트가 클립보드에 복사되었습니다!');
    } catch (error) {
        console.error('Error copying text to clipboard:', error);
        // Fallback for older browsers
        try {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showNotification('텍스트가 클립보드에 복사되었습니다!');
        } catch (fallbackError) {
            console.error('Fallback copy also failed:', fallbackError);
            showNotification('복사 실패', 'error');
        }
    }
}

// Copy image to clipboard
async function copyImageToClipboard(item) {
    try {
        console.log('Copying image to clipboard:', item);
        
        if (!item || item.type !== 'image') {
            throw new Error('이미지 데이터가 없습니다');
        }
        
        if (!item.dataUrl) {
            throw new Error('이미지 데이터 URL이 없습니다');
        }
        
        // Create image element to convert to PNG
        const img = new Image();
        
        return new Promise((resolve, reject) => {
            img.onload = async function() {
                try {
                    // Create canvas to convert image to PNG
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;
                    
                    // Draw image to canvas
                    ctx.drawImage(img, 0, 0);
                    
                    // Convert canvas to blob (PNG format)
                    canvas.toBlob(async (blob) => {
                        try {
                            if (!blob) {
                                throw new Error('이미지를 PNG로 변환할 수 없습니다');
                            }
                            
                            console.log('Converted image to PNG blob:', blob.type, blob.size);
                            
                            // Use Clipboard API with PNG blob
                            const clipboardItem = new ClipboardItem({
                                'image/png': blob
                            });
                            
                            await navigator.clipboard.write([clipboardItem]);
                            showNotification('이미지가 클립보드에 복사되었습니다!');
                            console.log('Image successfully copied to clipboard as PNG');
                            resolve();
                        } catch (clipboardError) {
                            console.error('Clipboard write error:', clipboardError);
                            reject(clipboardError);
                        }
                    }, 'image/png');
                } catch (canvasError) {
                    console.error('Canvas conversion error:', canvasError);
                    reject(canvasError);
                }
            };
            
            img.onerror = function() {
                const error = new Error('이미지를 로드할 수 없습니다');
                console.error('Image load error:', error);
                reject(error);
            };
            
            // Load the image
            img.src = item.dataUrl;
        });
        
    } catch (error) {
        console.error('Error copying image to clipboard:', error);
        showNotification(`이미지 복사 실패: ${error.message}`, 'error');
    }
}

// Delete a specific history item
async function deleteHistoryItem(itemId) {
    try {
        const result = await chrome.storage.local.get(['clipboardHistory']);
        const history = result.clipboardHistory || [];
        
        const updatedHistory = history.filter(item => item.id !== itemId);
        
        await chrome.storage.local.set({ clipboardHistory: updatedHistory });
        
        // UI will update automatically via storage change listener
    } catch (error) {
        console.error('Error deleting history item:', error);
    }
}

// Delete an image item
async function deleteImageItem(imageId) {
    try {
        await chrome.runtime.sendMessage({ 
            type: 'DELETE_IMAGE', 
            imageId: imageId 
        });
        showNotification('이미지가 삭제되었습니다');
    } catch (error) {
        console.error('Error deleting image item:', error);
        showNotification('이미지 삭제 실패', 'error');
    }
}

// Show clear all confirmation dialog
function showClearAllDialog() {
    confirmDialog.classList.remove('hidden');
}

// Hide clear all confirmation dialog
function hideClearAllDialog() {
    confirmDialog.classList.add('hidden');
}

// Clear all history
async function clearAllHistory() {
    try {
        await chrome.storage.local.set({ clipboardHistory: [] });
        
        // Also clear all images
        await chrome.runtime.sendMessage({ type: 'CLEAR_ALL_IMAGES' });
        
        hideClearAllDialog();
        showNotification('모든 클립보드 히스토리가 삭제되었습니다');
    } catch (error) {
        console.error('Error clearing history:', error);
        showNotification('히스토리 삭제 실패', 'error');
    }
}

// Show notification
function showNotification(message, type = 'success') {
    const notificationText = notification.querySelector('.notification-text');
    notificationText.textContent = message;
    
    // Update styling based on type
    if (type === 'error') {
        notification.style.background = '#dc3545';
    } else {
        notification.style.background = '#28a745';
    }
    
    notification.classList.remove('hidden');
    
    // Auto-hide after 2 seconds
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 2000);
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Utility function to format time ago
function getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return `${diffInSeconds}초 전`;
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes}분 전`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours}시간 전`;
    } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days}일 전`;
    }
}

// Utility function to get domain from URL
function getDomainFromUrl(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname;
    } catch (error) {
        return '알 수 없는 출처';
    }
}

// Handle keyboard shortcuts within the panel
document.addEventListener('keydown', (event) => {
    // Close panel with Escape key
    if (event.key === 'Escape') {
        if (!confirmDialog.classList.contains('hidden')) {
            hideClearAllDialog();
        }
    }
    
    // Clear all with Ctrl+Shift+Delete
    if (event.ctrlKey && event.shiftKey && event.key === 'Delete') {
        event.preventDefault();
        showClearAllDialog();
    }
});
