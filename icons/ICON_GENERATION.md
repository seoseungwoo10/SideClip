# SideClip Icon Documentation

## 🎨 Icon Design

The SideClip icon features a modern design representing the core functionality:
- **📋 Clipboard**: Main element showing clipboard management
- **📑 Side Panel**: Secondary element representing the side panel UI
- **🎨 Color Scheme**: Google Blue gradient (#4285F4 to #1A73E8)
- **✨ Effects**: Drop shadow and modern rounded corners

## 📁 Generated Files

### SVG Source
- `icon.svg` - Master SVG file (128x128 viewBox)
- `icon16.svg` - Copy of master SVG for reference

### PNG Icons (for Chrome Extension)
- `icon16.png` - 16x16 pixels (toolbar)
- `icon32.png` - 32x32 pixels (extension management)
- `icon48.png` - 48x48 pixels (extension details)
- `icon128.png` - 128x128 pixels (Chrome Web Store)

## 🔧 Generation Script

Icons were generated using `create_sideclip_icons.py`:
- Creates SVG with clipboard and side panel design
- Generates PNG fallbacks using basic Python libraries
- No external dependencies required

## 💡 Usage in Extension

1. **Manifest Icons**: All PNG sizes referenced in manifest.json
2. **Context Menu**: Enhanced with 📋 emoji for visual branding
3. **Action Button**: Uses icon set for different display contexts

## 🎯 Design Elements

- **Clipboard Body**: Blue gradient rectangle with rounded corners
- **Clipboard Clip**: Darker blue top element
- **Content Lines**: White lines representing clipboard content
- **Side Panel**: Light blue panel with content indicators
- **Connection**: Visual link between clipboard and panel
- **Shadow**: Subtle drop shadow for depth
magick icon16.svg -resize 16x16 icon16.png
magick icon16.svg -resize 32x32 icon32.png
magick icon16.svg -resize 48x48 icon48.png
magick icon16.svg -resize 128x128 icon128.png
```

## Option 3: Create Simple Placeholder PNGs
If you need quick placeholders, you can create simple colored squares:
- Create 16x16, 32x32, 48x48, and 128x128 pixel PNG files
- Use a clipboard-like blue color (#4285f4)
- Name them icon16.png, icon32.png, icon48.png, icon128.png

## Alternative: Use Emoji Icons
You can also create PNG icons from the clipboard emoji (📋) using any image editor.

Once you have the PNG files, place them in the icons/ directory and the extension will be ready to load!
