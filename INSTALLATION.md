# SideClip Installation Guide

## Quick Installation (Development Mode)

1. **Open Chrome Extensions Page**
   - Open Google Chrome
   - Navigate to `chrome://extensions/`
   - Or use Menu → More Tools → Extensions

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

3. **Load the Extension**
   - Click "Load unpacked" button
   - Navigate to and select the `chrome-clipboard` folder
   - The extension should appear in your extensions list

4. **Verify Installation**
   - Look for the SideClip icon in your Chrome toolbar
   - If not visible, click the extensions puzzle icon and pin SideClip

## Usage

### First Time Setup
1. Try copying some text from any webpage (Ctrl+C)
2. Click the SideClip icon or press Ctrl+Shift+H
3. Your copied text should appear in the side panel

### Daily Usage
- **Copy text**: Select text and press Ctrl+C as usual
- **Open history**: Click SideClip icon or press Ctrl+Shift+H  
- **Copy from history**: Click any item in the list
- **Delete items**: Click the × button next to any item
- **Clear all**: Click "Clear All" button (with confirmation)

## Troubleshooting

### Extension Won't Load
- Make sure you selected the correct folder containing `manifest.json`
- Check that all files are present (see file list below)
- Look for errors in the Chrome Extensions page

### Copy Detection Not Working  
- Make sure you're copying text (not images)
- Try refreshing the webpage and copying again
- Check if the extension has the necessary permissions

### Side Panel Won't Open
- Try clicking the extension icon directly
- Check if the keyboard shortcut conflicts with other extensions
- Reload the extension and try again

## Required Files

Your extension folder should contain:
```
chrome-clipboard/
├── manifest.json
├── background.js  
├── content.js
├── sidepanel.html
├── sidepanel.css
├── sidepanel.js
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

## Known Limitations (MVP)

- Only captures plain text (no images/rich content)
- Limited to 50 most recent items
- No search functionality
- No cloud sync between devices
- No import/export features

## Next Steps

Once you verify the extension works:
1. Replace placeholder icons with proper PNG icons (see `icons/ICON_GENERATION.md`)
2. Test all features thoroughly  
3. Consider publishing to Chrome Web Store
4. Gather user feedback for future improvements

## Support

If you encounter issues:
1. Check the Chrome Extensions page for error messages
2. Open Chrome DevTools on the side panel (right-click → Inspect)
3. Check the browser console for JavaScript errors
4. Verify all files are properly formatted
