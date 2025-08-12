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
        const result = await chrome.storage.local.get(['clipboardHistory']);
        const history = result.clipboardHistory || [];
        
        displayHistory(history);
        
        // Listen for storage changes to update UI in real-time
        chrome.storage.onChanged.addListener((changes, namespace) => {
            if (namespace === 'local' && changes.clipboardHistory) {
                displayHistory(changes.clipboardHistory.newValue || []);
            }
        });
    } catch (error) {
        console.error('Error loading clipboard history:', error);
    }
}

// Display history in the UI
function displayHistory(history) {
    // Clear current list
    historyList.innerHTML = '';
    
    if (history.length === 0) {
        emptyState.classList.remove('hidden');
        historyContainer.classList.add('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    historyContainer.classList.remove('hidden');
    
    // Create list items
    history.forEach((item, index) => {
        const listItem = createHistoryItem(item, index);
        historyList.appendChild(listItem);
    });
}

// Create a single history item element
function createHistoryItem(item, index) {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.setAttribute('data-id', item.id);
    
    // Format timestamp
    const timeAgo = getTimeAgo(new Date(item.timestamp));
    
    li.innerHTML = `
        <div class="item-content">
            <div class="item-text">${escapeHtml(item.preview)}</div>
            <div class="item-timestamp">${timeAgo}</div>
        </div>
        <button class="delete-btn" title="Delete this item">×</button>
    `;
    
    // Add click handler for copying
    const itemContent = li.querySelector('.item-content');
    itemContent.addEventListener('click', () => copyToClipboard(item.text));
    
    // Add click handler for delete button
    const deleteBtn = li.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteHistoryItem(item.id);
    });
    
    return li;
}

// Copy text to clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('Copied to clipboard!');
    } catch (error) {
        console.error('Error copying to clipboard:', error);
        // Fallback for older browsers
        try {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showNotification('Copied to clipboard!');
        } catch (fallbackError) {
            console.error('Fallback copy also failed:', fallbackError);
            showNotification('Failed to copy', 'error');
        }
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
        hideClearAllDialog();
        showNotification('All clipboard history cleared');
    } catch (error) {
        console.error('Error clearing history:', error);
        showNotification('Failed to clear history', 'error');
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

// Utility function to get time ago string
function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) {
        return 'Just now';
    } else if (diffMins < 60) {
        return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;
    } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else if (diffDays < 7) {
        return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    } else {
        return date.toLocaleDateString();
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
