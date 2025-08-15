# SideClip Installation Guide

Complete installation and setup guide for the SideClip Chrome extension with text and image clipboard history functionality.

## 🚀 Quick Installation (Development Mode)

### Prerequisites
- **Google Chrome**: Version 114 or higher (required for Manifest V3 and Side Panel API)
- **Operating System**: Windows, macOS, or Linux
- **Permissions**: Admin rights may be needed for extension installation

### Step-by-Step Installation

1. **Download SideClip**
   - Clone the repository: `git clone [repository-url]`
   - Or download ZIP file and extract to a folder
   - Ensure all files are in the `SideClip/` directory

2. **Open Chrome Extensions Page**
   - Method 1: Navigate to `chrome://extensions/`
   - Method 2: Chrome Menu → More Tools → Extensions
   - Method 3: Right-click Chrome toolbar → Manage Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner
   - Additional developer options will appear

4. **Load the Extension**
   - Click "Load unpacked" button
   - Navigate to and select the `SideClip` folder
   - Ensure you select the folder containing `manifest.json`
   - The extension should appear in your extensions list

5. **Verify Installation**
   - Look for the SideClip icon (📋) in your Chrome toolbar
   - If not visible, click the extensions puzzle piece icon (⋮) and pin SideClip
   - Extension should show as "Enabled" in the extensions page

## 🎯 Initial Setup & Testing

### First Time Setup

1. **Test Text Functionality**
   ```
   1. Visit any webpage
   2. Select and copy some text (Ctrl+C or Cmd+C)
   3. Click the SideClip icon or press Ctrl+Shift+H
   4. Verify your copied text appears in the side panel
   ```

2. **Test Image Functionality**
   ```
   1. Find an image on any webpage
   2. Right-click the image
   3. Select "📋 SideClip에 이미지 복사" from context menu
   4. Open SideClip to see the image thumbnail
   5. Click the thumbnail to copy it back to clipboard
   ```

3. **Test Keyboard Shortcuts**
   ```
   - Ctrl+Shift+H (Cmd+Shift+H on Mac): Toggle side panel
   - Escape: Close confirmation dialogs
   ```

### Troubleshooting First Setup

**Issue**: SideClip icon not visible
- **Solution**: Click extensions puzzle icon → Pin SideClip

**Issue**: Context menu not appearing
- **Solution**: Reload extension in chrome://extensions/

**Issue**: Side panel not opening
- **Solution**: Ensure Chrome version 114+, try restarting Chrome

## 📋 Daily Usage Guide

### Text Operations
- **Copy Text**: Select text and use Ctrl+C as usual
- **Access History**: Click SideClip icon or Ctrl+Shift+H
- **Reuse Text**: Click any text item in history
- **Delete Text**: Click "×" button next to items

### Image Operations  
- **Save Images**: Right-click image → "📋 SideClip에 이미지 복사"
- **View Images**: Thumbnails show in history with size info
- **Copy Images**: Click thumbnail to copy as PNG to clipboard
- **Delete Images**: Use "×" button or "Clear All"

## 🔧 Advanced Configuration

### Permissions Overview
SideClip requires these permissions for full functionality:

- **storage**: Save clipboard history locally
- **sidePanel**: Display history in Chrome's side panel
- **activeTab**: Detect copy events on current tab
- **contextMenus**: Add image save option to right-click menu
- **scripting**: Inject content script for copy detection
- **clipboardRead**: Access clipboard for image operations
- **host_permissions**: Access all HTTP/HTTPS sites for image download

### Storage Information
- **Text Storage**: Chrome's local storage (chrome.storage.local)
- **Image Storage**: Browser's IndexedDB for large file support
- **History Limit**: 50 most recent items (auto-cleanup)
- **Size Limits**: 5MB maximum per image file
- **Location**: Local device only (no cloud sync)

## 🛠️ Troubleshooting

### Common Issues & Solutions

**❌ Extension won't load**
- Check Chrome version (114+ required)
- Ensure `manifest.json` is in the selected folder
- Try restarting Chrome and reloading extension

**❌ Text not being captured**
- Verify content script injection in developer tools
- Check if website blocks content scripts
- Try reloading the page

**❌ Images not saving**
- Check if image exceeds 5MB limit
- Verify internet connection for external images
- Try different image formats (JPEG, PNG, GIF)

**❌ Side panel not opening**
- Update Chrome to version 114 or higher
- Check if Side Panel API is supported
- Try keyboard shortcut Ctrl+Shift+H

**❌ Context menu missing**
- Reload extension in chrome://extensions/
- Check if other extensions interfere
- Right-click specifically on images, not other elements

## 📞 Support & Resources

### Getting Help
- **GitHub Issues**: Report bugs and feature requests
- **Documentation**: Check README.md for detailed information
- **Console Logs**: Include error messages when reporting issues

### Required Files Structure
```
SideClip/
├── manifest.json          # Extension manifest (v3)
├── background.js          # Service worker with image handling
├── content.js            # Content script for copy detection
├── sidepanel.html        # Side panel HTML structure
├── sidepanel.css         # Modern responsive styles
├── sidepanel.js          # Side panel functionality & UI
├── imageDB.js           # IndexedDB management for images
├── validate.js          # Input validation utilities
├── icons/               # Extension icons (all sizes)
└── docs/               # Documentation files
```

---

**SideClip v1.2.250815** - Installation Guide  
For technical support, please refer to the GitHub repository.
