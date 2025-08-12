# SideClip - Chrome Clipboard History Extension

A Chrome extension that provides clipboard history functionality directly in the browser's side panel.

## Features

- **Automatic Text Capture**: Automatically saves copied text to clipboard history
- **Side Panel Interface**: Clean, modern UI accessible via Chrome's side panel
- **One-Click Copy**: Click any history item to copy it back to clipboard
- **Delete Items**: Remove individual items or clear entire history
- **Keyboard Shortcuts**: Quick access with Ctrl+Shift+H
- **Persistent Storage**: History survives browser restarts
- **Real-time Updates**: UI updates instantly when clipboard changes

## Installation

### From Source (Development)

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. The SideClip icon should appear in your toolbar

### From Chrome Web Store

*Coming soon...*

## Usage

### Opening the Side Panel

- Click the SideClip icon in the Chrome toolbar
- Use the keyboard shortcut `Ctrl+Shift+H` (or `Cmd+Shift+H` on Mac)

### Copying Text to History

1. Select any text on a webpage
2. Copy it using `Ctrl+C` (or `Cmd+C` on Mac)
3. The text automatically appears in your SideClip history

### Using Clipboard History

1. Open the SideClip side panel
2. Click any item in the history to copy it to your clipboard
3. Use the "×" button to delete individual items
4. Use "Clear All" to remove all history (with confirmation)

## Keyboard Shortcuts

- `Ctrl+Shift+H` - Toggle side panel
- `Ctrl+Shift+Delete` - Clear all history (when panel is open)
- `Escape` - Close confirmation dialogs

## Technical Details

- **Manifest Version**: 3
- **Permissions**: storage, sidePanel, activeTab
- **Storage Limit**: 50 most recent items
- **Text Preview**: First 100 characters shown in list
- **Supported Content**: Plain text only (MVP)

## Privacy

- All clipboard data is stored locally on your device
- No data is sent to external servers
- History is private to your browser profile
- You can clear all data at any time

## Development

### Project Structure

```
chrome-clipboard/
├── manifest.json          # Extension manifest
├── background.js          # Service worker
├── content.js            # Content script for copy detection
├── sidepanel.html        # Side panel HTML
├── sidepanel.css         # Side panel styles
├── sidepanel.js          # Side panel functionality
├── icons/                # Extension icons
└── README.md             # This file
```

### Building

No build process required - this is a pure JavaScript extension that can be loaded directly into Chrome.

### Testing

1. Load the extension in Chrome
2. Copy some text from various websites
3. Open the side panel to verify history appears
4. Test copying items back to clipboard
5. Test delete functionality and clear all

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Roadmap

Future versions may include:
- Search functionality
- Settings/options page
- Cloud sync
- Image clipboard support
- Pinned/favorite items
- Export/import functionality
