import os
import base64

def create_svg_icon():
    """Create SideClip SVG icon with clipboard and side panel design"""
    svg_content = '''<?xml version="1.0" encoding="UTF-8"?>
<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="clipboardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4285F4;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1A73E8;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <!-- Clipboard background -->
  <rect x="20" y="16" width="60" height="80" rx="6" ry="6" 
        fill="url(#clipboardGradient)" 
        stroke="#1A73E8" 
        stroke-width="2"
        filter="url(#shadow)"/>
  
  <!-- Clipboard clip -->
  <rect x="35" y="8" width="30" height="12" rx="4" ry="4" 
        fill="#1A73E8"/>
  
  <!-- Content lines on clipboard -->
  <rect x="28" y="30" width="44" height="3" rx="1" fill="#FFFFFF" opacity="0.9"/>
  <rect x="28" y="38" width="40" height="3" rx="1" fill="#FFFFFF" opacity="0.9"/>
  <rect x="28" y="46" width="36" height="3" rx="1" fill="#FFFFFF" opacity="0.9"/>
  <rect x="28" y="54" width="42" height="3" rx="1" fill="#FFFFFF" opacity="0.9"/>
  
  <!-- Side panel representation -->
  <rect x="88" y="24" width="20" height="56" rx="3" ry="3" 
        fill="#E8F0FE" 
        stroke="#4285F4" 
        stroke-width="1"/>
  
  <!-- Side panel content lines -->
  <rect x="92" y="30" width="12" height="2" rx="1" fill="#4285F4" opacity="0.7"/>
  <rect x="92" y="36" width="10" height="2" rx="1" fill="#4285F4" opacity="0.7"/>
  <rect x="92" y="42" width="14" height="2" rx="1" fill="#4285F4" opacity="0.7"/>
  <rect x="92" y="48" width="8" height="2" rx="1" fill="#4285F4" opacity="0.7"/>
  <rect x="92" y="54" width="11" height="2" rx="1" fill="#4285F4" opacity="0.7"/>
  
  <!-- Connection line (optional visual link) -->
  <line x1="80" y1="52" x2="88" y2="52" stroke="#4285F4" stroke-width="2" opacity="0.5"/>
  
  <!-- Small clipboard icon in corner for branding -->
  <circle cx="95" cy="70" r="3" fill="#4285F4" opacity="0.8"/>
</svg>'''
    return svg_content

def svg_to_simple_png_data(size):
    """Create a simple PNG representation (very basic, for fallback)"""
    # This creates a minimal PNG with a blue square (fallback if SVG not supported)
    # PNG header for blue square
    width = size
    height = size
    
    # Simple blue square PNG data (base64 encoded)
    # This is a minimal 16x16 blue square PNG
    if size <= 16:
        return base64.b64decode(
            'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAABNJREFUOI1j'
            'YKAUsGahyqAaMhAAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4A'
            'HgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4A'
            'HgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4A'
            'HgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4A'
            'Hg=='
        )
    
    # For larger sizes, create a basic blue rectangle
    return create_simple_blue_png(size)

def create_simple_blue_png(size):
    """Create a simple blue PNG manually"""
    # This is a simplified approach - creating a basic PNG structure
    # For production, you'd want to use proper image libraries
    import struct
    import zlib
    
    def write_png(width, height, pixels):
        def write_chunk(f, chunk_type, data):
            f.write(struct.pack('>I', len(data)))
            f.write(chunk_type)
            f.write(data)
            crc = zlib.crc32(chunk_type + data) & 0xffffffff
            f.write(struct.pack('>I', crc))
        
        from io import BytesIO
        f = BytesIO()
        f.write(b'\x89PNG\r\n\x1a\n')
        
        # IHDR chunk
        ihdr = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
        write_chunk(f, b'IHDR', ihdr)
        
        # IDAT chunk
        compressor = zlib.compressobj()
        png_data = b''
        for y in range(height):
            png_data += b'\x00'  # Filter type
            for x in range(width):
                # Blue color (RGB)
                png_data += bytes([0x42, 0x85, 0xF4])  # #4285F4
        
        idat = compressor.compress(png_data)
        idat += compressor.flush()
        write_chunk(f, b'IDAT', idat)
        
        # IEND chunk
        write_chunk(f, b'IEND', b'')
        
        return f.getvalue()
    
    # Create blue pixels
    return write_png(size, size, None)

# Create icons directory if it doesn't exist
os.makedirs('icons', exist_ok=True)

# Create SVG icon
svg_content = create_svg_icon()
with open('icons/icon.svg', 'w') as f:
    f.write(svg_content)

# Also save as icon16.svg for reference
with open('icons/icon16.svg', 'w') as f:
    f.write(svg_content)

print("✅ SideClip SVG icon created!")
print("📋 Features clipboard with side panel design")
print("🎨 Modern blue gradient (#4285F4 to #1A73E8)")
print("📁 Saved as icons/icon.svg and icons/icon16.svg")

# Create simple PNG fallbacks
sizes = [16, 32, 48, 128]
for size in sizes:
    try:
        png_data = create_simple_blue_png(size)
        with open(f'icons/icon{size}.png', 'wb') as f:
            f.write(png_data)
        print(f"✅ Created fallback icon{size}.png")
    except Exception as e:
        print(f"⚠️  Could not create icon{size}.png: {e}")

print("\n🎯 Icons ready for Chrome extension!")
