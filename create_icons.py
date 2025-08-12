import base64
import os

# Simple 16x16 blue PNG (minimal valid PNG)
png_16 = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x10\x00\x00\x00\x10\x08\x02\x00\x00\x00\x90\x91h6\x00\x00\x00\x19tEXtSoftware\x00Adobe ImageReadyq\xc9e<\x00\x00\x00>IDATx\xdab\xfc\x0f\x00\x01\x01\x01\x00\x01\x01\x01\x00\x01\x01\x01\x00\x01\x01\x01\x00\x01\x01\x01\x00\x01\x01\x01\x00\x01\x01\x01\x00\x01\x01\x01\x00\x01\x01\x01\x00\x01\x01\x01\x00\x01\x01\x01\x00\x01\x01\x01\x00\x01\x01\x01\x00\x00\x02\x03\x01\x00\x01\x01\x00\x00\x00\x00IEND\xaeB`\x82'

# Create icons directory if it doesn't exist
os.makedirs('icons', exist_ok=True)

# Save different sizes (same image, just different filenames for Chrome)
with open('icons/icon16.png', 'wb') as f:
    f.write(png_16)

with open('icons/icon32.png', 'wb') as f:
    f.write(png_16)

with open('icons/icon48.png', 'wb') as f:
    f.write(png_16)

with open('icons/icon128.png', 'wb') as f:
    f.write(png_16)

print("Created placeholder PNG icons")
