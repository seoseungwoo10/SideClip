# SideClip - Chrome Clipboard History Extension

A powerful Chrome extension that provides comprehensive clipboard history functionality directly in the browser's side panel, supporting both text and images with advanced features.

## ✨ Features

### 📋 Text Management
- **Automatic Text Capture**: Automatically saves copied text to clipboard history
- **Smart Text Preview**: Shows first 100 characters with full content on click
- **Text Formatting**: Preserves line breaks and whitespace
- **Quick Copy**: One-click to copy any text item back to clipboard

### 🖼️ Image Support
- **Image Capture**: Right-click context menu to save images to history
- **Thumbnail Previews**: High-quality thumbnails with responsive scaling
- **Format Conversion**: Automatic PNG conversion for clipboard compatibility
- **Size Information**: Display file size and dimensions
- **Large Image Support**: Handles images up to 5MB with automatic cleanup

### 🎨 User Interface
- **Side Panel Interface**: Modern, responsive UI in Chrome's side panel
- **Visual Distinction**: Clear indicators for text vs image items with icons
- **Responsive Design**: Adapts to different panel sizes (300px-400px+)
- **Hover Effects**: Smooth animations and visual feedback
- **Glowing Borders**: Elegant hover effects on image thumbnails

### 🔧 Advanced Features
- **Persistent Storage**: IndexedDB for images, chrome.storage for text history
- **Real-time Updates**: Instant UI updates when clipboard changes
- **Smart Cleanup**: Automatic storage management and quota handling
- **Error Recovery**: Robust error handling with fallback mechanisms
- **CORS Solutions**: Background script handling for cross-origin images

### ⌨️ Keyboard & Controls
- **Keyboard Shortcuts**: Quick access with Ctrl+Shift+H (Cmd+Shift+H on Mac)
- **Delete Management**: Remove individual items or clear entire history
- **Confirmation Dialogs**: Safe deletion with user confirmation
- **Context Menus**: Enhanced right-click menu with clipboard emoji

## 🚀 Installation

### From Source (Development)

1. **Download**: Clone or download this repository
2. **Chrome Extensions**: Navigate to `chrome://extensions/`
3. **Developer Mode**: Enable "Developer mode" in the top right
4. **Load Extension**: Click "Load unpacked" and select the extension directory
5. **Verify**: The SideClip icon should appear in your toolbar

### From Chrome Web Store

*Coming soon to Chrome Web Store...*

## 📖 Usage Guide

### Opening SideClip

**Method 1**: Click the SideClip icon (📋) in Chrome toolbar  
**Method 2**: Use keyboard shortcut `Ctrl+Shift+H` (or `Cmd+Shift+H` on Mac)

### Text Operations

1. **Copy Text**: Select any text and use `Ctrl+C` (or `Cmd+C`)
2. **View History**: Text automatically appears in SideClip with timestamp
3. **Reuse Text**: Click any text item to copy it back to clipboard
4. **Delete Text**: Use the "×" button to remove individual items

### Image Operations

1. **Save Image**: Right-click any image → "📋 SideClip에 이미지 복사"
2. **View Images**: Images appear with thumbnails and size information
3. **Copy Images**: Click image thumbnail to copy to clipboard (PNG format)
4. **Image Details**: View dimensions and file size on hover
### Management & Cleanup

1. **Individual Delete**: Use "×" button next to any item
2. **Clear All**: "Clear All" button removes entire history (with confirmation)
3. **Auto Cleanup**: History limited to 50 items (oldest items removed automatically)
4. **Storage Management**: Images over 5MB automatically skipped

## ⌨️ Keyboard Shortcuts & Controls

- **`Ctrl+Shift+H`** - Toggle SideClip side panel
- **`Escape`** - Close confirmation dialogs
- **Click** - Copy item to clipboard
- **Right-click + Context Menu** - Save images to SideClip

## 🛠️ Technical Specifications

### Core Technology
- **Manifest Version**: 3 (latest Chrome extension standard)
- **Storage**: IndexedDB for images, chrome.storage.local for text
- **Permissions**: storage, sidePanel, activeTab, contextMenus, scripting, clipboardRead
- **Host Permissions**: All HTTP/HTTPS sites for CORS handling

### Performance & Limits
- **History Limit**: 50 most recent items
- **Image Size Limit**: 5MB maximum per image
- **Text Preview**: First 100 characters in history list
- **Storage Cleanup**: Automatic quota management

### Browser Support
- **Chrome**: Version 114+ (Manifest V3 requirement)
- **Side Panel API**: Chrome 114+ required
- **IndexedDB**: Full browser support for image storage

## 🔒 Privacy & Security

- **Local Storage Only**: All data stored locally on your device
- **No External Servers**: No data transmission to remote servers
- **Profile Private**: History private to your browser profile
- **User Control**: Complete control over data deletion
- **CORS Compliance**: Secure cross-origin image handling

## 🧪 Development

### Project Structure

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
├── icons/               # Extension icons (16,32,48,128px)
│   ├── icon16.svg       # SVG source
│   └── *.png           # PNG versions for Chrome
└── docs/               # Documentation files
    ├── README.md       # This file
    ├── README_KO.md    # Korean documentation
    ├── INSTALLATION.md # Installation guide
    └── INSTALLATION_KO.md # Korean installation guide
```

### Building & Testing

**No Build Required**: Pure JavaScript extension, loads directly into Chrome

**Testing Checklist**:
1. ✅ Load extension in Chrome Developer Mode
2. ✅ Copy text from various websites 
3. ✅ Right-click save images from different domains
4. ✅ Verify side panel opens with Ctrl+Shift+H
5. ✅ Test copying items back to clipboard
6. ✅ Test delete functionality and clear all
7. ✅ Verify responsive design at different panel widths
8. ✅ Test image format conversion (JPEG→PNG)

### Development Commands

```bash
# Icon generation
python create_sideclip_icons.py

# Icon preview
open icon-preview.html

# Extension reload
Chrome Extensions → Developer Mode → Reload
```

## 🗺️ Roadmap & Future Features

### Planned Features
- 🔍 **Search Functionality**: Search through text and image history
- ⚙️ **Settings Page**: Customizable options and preferences  
- ☁️ **Cloud Sync**: Optional sync across devices
- 📌 **Pinned Items**: Mark important items as favorites
- 📊 **Export/Import**: Backup and restore functionality
- 🏷️ **Categories**: Organize clips with tags or folders

### Technical Improvements
- 🎨 **Theme Support**: Dark/light mode options
- 🔔 **Notifications**: Optional copy confirmations
- 📱 **Mobile Support**: Future mobile browser compatibility
- 🚀 **Performance**: Further optimization for large histories

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please read contributing guidelines and submit pull requests.

## 📞 Support

- **Issues**: GitHub Issues for bug reports
- **Feature Requests**: GitHub Discussions
- **Documentation**: See docs/ folder for detailed guides

---

**SideClip v1.2.250815** - Made with ❤️ for productivity enthusiasts