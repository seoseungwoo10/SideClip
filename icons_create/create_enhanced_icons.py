import os
import struct
import zlib

def create_detailed_sideclip_png(size):
    """Create detailed SideClip PNG with better visual design"""
    
    # Calculate scale factor
    scale = size / 128.0
    
    # Color palette
    colors = {
        'bg': (248, 249, 250),        # Background
        'clipboard': (66, 133, 244),   # Main clipboard blue
        'clipboard_dark': (26, 115, 232),  # Dark blue for clip
        'white': (255, 255, 255),      # Content lines
        'panel_bg': (232, 240, 254),   # Side panel background
        'panel_content': (66, 133, 244), # Panel content
        'shadow': (200, 200, 200),     # Shadow color
    }
    
    # Initialize canvas
    canvas = [[colors['bg'] for _ in range(size)] for _ in range(size)]
    
    # Helper function to draw filled rectangle
    def draw_rect(x, y, w, h, color):
        for py in range(max(0, y), min(size, y + h)):
            for px in range(max(0, x), min(size, x + w)):
                canvas[py][px] = color
    
    # Helper function to draw rounded rectangle (simplified)
    def draw_rounded_rect(x, y, w, h, color, radius=None):
        if radius is None:
            radius = max(1, int(2 * scale))
        
        # Draw main rectangle
        draw_rect(x + radius, y, w - 2*radius, h, color)
        draw_rect(x, y + radius, w, h - 2*radius, color)
        
        # Draw corners (simplified)
        for corner_y in range(y, y + radius):
            for corner_x in range(x, x + radius):
                if (corner_x - x)**2 + (corner_y - y)**2 <= radius**2:
                    canvas[corner_y][corner_x] = color
        
        for corner_y in range(y, y + radius):
            for corner_x in range(x + w - radius, x + w):
                if (corner_x - (x + w - radius))**2 + (corner_y - y)**2 <= radius**2:
                    canvas[corner_y][corner_x] = color
        
        for corner_y in range(y + h - radius, y + h):
            for corner_x in range(x, x + radius):
                if (corner_x - x)**2 + (corner_y - (y + h - radius))**2 <= radius**2:
                    canvas[corner_y][corner_x] = color
        
        for corner_y in range(y + h - radius, y + h):
            for corner_x in range(x + w - radius, x + w):
                if (corner_x - (x + w - radius))**2 + (corner_y - (y + h - radius))**2 <= radius**2:
                    canvas[corner_y][corner_x] = color
    
    # Calculate dimensions
    margin = max(2, int(16 * scale))
    clipboard_width = max(8, int(48 * scale))
    clipboard_height = max(10, int(64 * scale))
    clipboard_x = margin
    clipboard_y = max(2, int(12 * scale))
    
    # Draw shadow first (offset)
    shadow_offset = max(1, int(2 * scale))
    draw_rounded_rect(
        clipboard_x + shadow_offset, 
        clipboard_y + shadow_offset,
        clipboard_width, 
        clipboard_height, 
        colors['shadow']
    )
    
    # Draw main clipboard
    draw_rounded_rect(
        clipboard_x, clipboard_y, 
        clipboard_width, clipboard_height, 
        colors['clipboard']
    )
    
    # Draw clipboard clip
    clip_width = max(4, int(20 * scale))
    clip_height = max(2, int(8 * scale))
    clip_x = clipboard_x + (clipboard_width - clip_width) // 2
    clip_y = max(1, int(6 * scale))
    
    draw_rounded_rect(clip_x, clip_y, clip_width, clip_height, colors['clipboard_dark'])
    
    # Draw content lines
    content_margin = max(2, int(6 * scale))
    content_x = clipboard_x + content_margin
    content_width = clipboard_width - 2 * content_margin
    line_height = max(1, int(2 * scale))
    line_spacing = max(2, int(6 * scale))
    
    start_y = clipboard_y + max(3, int(12 * scale))
    
    for i in range(4):
        line_y = start_y + i * line_spacing
        if line_y + line_height < clipboard_y + clipboard_height - content_margin:
            # Vary line widths
            line_w = content_width if i < 2 else int(content_width * 0.8)
            draw_rect(content_x, line_y, line_w, line_height, colors['white'])
    
    # Draw side panel if there's space
    panel_x = clipboard_x + clipboard_width + max(2, int(6 * scale))
    panel_width = max(4, int(16 * scale))
    panel_height = max(8, int(48 * scale))
    panel_y = clipboard_y + max(2, int(8 * scale))
    
    if panel_x + panel_width < size - 2:
        draw_rounded_rect(panel_x, panel_y, panel_width, panel_height, colors['panel_bg'])
        
        # Panel content lines
        panel_content_margin = max(1, int(2 * scale))
        panel_content_x = panel_x + panel_content_margin
        panel_content_width = panel_width - 2 * panel_content_margin
        panel_line_height = max(1, int(1 * scale))
        panel_line_spacing = max(1, int(4 * scale))
        
        panel_start_y = panel_y + max(2, int(4 * scale))
        
        for i in range(3):
            panel_line_y = panel_start_y + i * panel_line_spacing
            if panel_line_y + panel_line_height < panel_y + panel_height - panel_content_margin:
                # Vary panel line widths
                panel_line_w = int(panel_content_width * (0.8 if i == 1 else 1.0))
                draw_rect(panel_content_x, panel_line_y, panel_line_w, panel_line_height, colors['panel_content'])
    
    # Convert canvas to RGB data
    rgb_data = []
    for row in canvas:
        for pixel in row:
            rgb_data.extend(pixel)
    
    return create_png_from_rgb_data(size, size, rgb_data)

def create_png_from_rgb_data(width, height, rgb_data):
    """Create PNG from RGB data"""
    
    def crc32(data):
        return zlib.crc32(data) & 0xffffffff
    
    def write_chunk(chunk_type, data):
        chunk_length = struct.pack('>I', len(data))
        chunk_data = chunk_type + data
        chunk_crc = struct.pack('>I', crc32(chunk_data))
        return chunk_length + chunk_data + chunk_crc
    
    # PNG file signature
    png_signature = b'\x89PNG\r\n\x1a\n'
    
    # IHDR chunk (image header)
    ihdr_data = struct.pack('>IIBBBBB', 
                           width,    # Width
                           height,   # Height  
                           8,        # Bit depth
                           2,        # Color type (RGB)
                           0,        # Compression method
                           0,        # Filter method
                           0)        # Interlace method
    ihdr_chunk = write_chunk(b'IHDR', ihdr_data)
    
    # IDAT chunk (image data)
    # Prepare scanlines with filter bytes
    scanlines = b''
    for y in range(height):
        scanlines += b'\x00'  # Filter type: None
        row_start = y * width * 3
        row_end = row_start + width * 3
        scanlines += bytes(rgb_data[row_start:row_end])
    
    # Compress the image data
    compressed_data = zlib.compress(scanlines, 9)
    idat_chunk = write_chunk(b'IDAT', compressed_data)
    
    # IEND chunk (image trailer)
    iend_chunk = write_chunk(b'IEND', b'')
    
    # Combine all chunks
    png_data = png_signature + ihdr_chunk + idat_chunk + iend_chunk
    
    return png_data

# Create icons directory
os.makedirs('icons', exist_ok=True)

# Generate icons
sizes = [16, 32, 48, 128]

print("🎨 Creating detailed SideClip PNG icons...")
print("📋 Features: Clipboard + Side Panel + Shadow + Rounded corners")

for size in sizes:
    try:
        png_data = create_detailed_sideclip_png(size)
        filename = f'icons/icon{size}.png'
        
        with open(filename, 'wb') as f:
            f.write(png_data)
        
        file_size = len(png_data)
        print(f"✅ {filename}: {file_size} bytes ({size}x{size})")
        
    except Exception as e:
        print(f"❌ Error creating {size}x{size} icon: {e}")

print("\n🎯 Enhanced PNG icons created successfully!")
print("🔍 Now with proper clipboard design, side panel, and visual details")
