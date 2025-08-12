# Icon Generation Instructions

Since Chrome extensions require PNG icons, you'll need to convert the SVG to PNG format in different sizes.

## Option 1: Online Conversion
1. Use an online SVG to PNG converter like:
   - https://convertio.co/svg-png/
   - https://cloudconvert.com/svg-to-png
   
2. Upload the icon16.svg file
3. Generate PNG versions in these sizes:
   - 16x16 pixels → save as icon16.png
   - 32x32 pixels → save as icon32.png  
   - 48x48 pixels → save as icon48.png
   - 128x128 pixels → save as icon128.png

## Option 2: Using ImageMagick (if installed)
Run these commands in the icons directory:

```bash
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
