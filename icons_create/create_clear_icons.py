import os
import struct
import zlib

def create_simple_but_clear_png(size):
    """Create a simple but recognizable SideClip icon"""
    
    # Simple color scheme
    bg_color = (255, 255, 255, 0)      # Transparent background
    main_color = (66, 133, 244)        # SideClip blue
    dark_color = (26, 115, 232)        # Darker blue
    white_color = (255, 255, 255)      # White
    
    # Create RGBA canvas (with alpha)
    canvas = [[(255, 255, 255, 0) for _ in range(size)] for _ in range(size)]
    
    def set_pixel(x, y, color):
        if 0 <= x < size and 0 <= y < size:
            canvas[y][x] = color
    
    def draw_filled_rect(x, y, w, h, color):
        for py in range(y, min(y + h, size)):
            for px in range(x, min(x + w, size)):
                set_pixel(px, py, color)
    
    # Calculate proportional sizes
    if size >= 48:
        # Larger icons - more detail
        margin = size // 8
        clipboard_w = size - 2 * margin
        clipboard_h = int(clipboard_w * 1.3)
        clipboard_x = margin
        clipboard_y = (size - clipboard_h) // 2
        
        # Main clipboard rectangle
        draw_filled_rect(clipboard_x, clipboard_y, clipboard_w, clipboard_h, main_color)
        
        # Clipboard clip
        clip_w = clipboard_w // 3
        clip_h = size // 12
        clip_x = clipboard_x + (clipboard_w - clip_w) // 2
        clip_y = clipboard_y - clip_h // 2
        draw_filled_rect(clip_x, clip_y, clip_w, clip_h, dark_color)
        
        # Content lines
        line_margin = clipboard_w // 6
        line_w = clipboard_w - 2 * line_margin
        line_h = max(1, size // 32)
        line_spacing = size // 16
        
        for i in range(3):
            line_x = clipboard_x + line_margin
            line_y = clipboard_y + clipboard_h // 4 + i * line_spacing
            if i == 2:  # Make last line shorter
                line_w = int(line_w * 0.7)
            draw_filled_rect(line_x, line_y, line_w, line_h, white_color)
        
        # Side panel indicator (small rectangle on the right)
        if size >= 64:
            panel_w = size // 16
            panel_h = clipboard_h // 2
            panel_x = clipboard_x + clipboard_w + size // 32
            panel_y = clipboard_y + clipboard_h // 4
            
            if panel_x + panel_w < size:
                draw_filled_rect(panel_x, panel_y, panel_w, panel_h, (232, 240, 254))
    
    elif size >= 24:
        # Medium icons - simplified
        clipboard_size = size - 4
        clipboard_x = 2
        clipboard_y = 2
        
        # Main clipboard
        draw_filled_rect(clipboard_x, clipboard_y, clipboard_size, clipboard_size, main_color)
        
        # Clip
        clip_w = clipboard_size // 3
        clip_h = 2
        clip_x = clipboard_x + (clipboard_size - clip_w) // 2
        clip_y = clipboard_y - 1
        draw_filled_rect(clip_x, clip_y, clip_w, clip_h, dark_color)
        
        # Simple content indication
        content_size = clipboard_size - 4
        content_x = clipboard_x + 2
        content_y = clipboard_y + 2
        
        for i in range(2):
            line_y = content_y + i * 3
            line_w = content_size - (i * 2)
            draw_filled_rect(content_x, line_y, line_w, 1, white_color)
    
    else:
        # Very small icons - just a recognizable shape
        icon_size = size - 2
        icon_x = 1
        icon_y = 1
        
        # Simple clipboard shape
        draw_filled_rect(icon_x, icon_y, icon_size, icon_size, main_color)
        
        # Tiny clip
        clip_w = icon_size // 2
        clip_x = icon_x + (icon_size - clip_w) // 2
        draw_filled_rect(clip_x, icon_y - 1, clip_w, 1, dark_color)
        
        # Single content line
        if size >= 12:
            content_w = icon_size - 2
            content_x = icon_x + 1
            content_y = icon_y + icon_size // 2
            draw_filled_rect(content_x, content_y, content_w, 1, white_color)
    
    # Convert to RGBA data
    rgba_data = []
    for row in canvas:
        for pixel in row:
            if len(pixel) == 3:  # RGB
                rgba_data.extend([pixel[0], pixel[1], pixel[2], 255])
            else:  # RGBA
                rgba_data.extend(pixel)
    
    return create_png_rgba(size, size, rgba_data)

def create_png_rgba(width, height, rgba_data):
    """Create PNG with RGBA data"""
    
    def crc32(data):
        return zlib.crc32(data) & 0xffffffff
    
    def write_chunk(chunk_type, data):
        length = struct.pack('>I', len(data))
        chunk = chunk_type + data
        crc = struct.pack('>I', crc32(chunk))
        return length + chunk + crc
    
    # PNG signature
    png = b'\x89PNG\r\n\x1a\n'
    
    # IHDR - Image header
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)  # 6 = RGBA
    png += write_chunk(b'IHDR', ihdr)
    
    # IDAT - Image data
    scanlines = b''
    for y in range(height):
        scanlines += b'\x00'  # No filter
        start = y * width * 4
        end = start + width * 4
        scanlines += bytes(rgba_data[start:end])
    
    compressed = zlib.compress(scanlines)
    png += write_chunk(b'IDAT', compressed)
    
    # IEND - End
    png += write_chunk(b'IEND', b'')
    
    return png

# Generate icons
os.makedirs('icons', exist_ok=True)

sizes = [16, 32, 48, 128]

print("🎨 Creating clear and simple SideClip PNG icons...")
print("📋 Design: Simplified but recognizable clipboard with clip")

for size in sizes:
    try:
        png_data = create_simple_but_clear_png(size)
        filename = f'icons/icon{size}.png'
        
        with open(filename, 'wb') as f:
            f.write(png_data)
        
        print(f"✅ {filename}: {len(png_data)} bytes")
        
    except Exception as e:
        print(f"❌ Error creating {size}x{size}: {e}")

print("\n🎯 Clear PNG icons created!")
print("📋 Simple but recognizable clipboard design")
print("🔍 Should display properly in browsers and Chrome extension")
