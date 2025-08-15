import os
import base64
import struct
import zlib

def create_sideclip_png(size):
    """Create a proper SideClip PNG icon manually"""
    
    # Calculate scaled dimensions
    scale = size / 128.0
    
    # Create RGBA image data (with transparency)
    width, height = size, size
    
    # Background color (transparent)
    bg_r, bg_g, bg_b, bg_a = 0, 0, 0, 0  # Transparent background
    
    # Main clipboard color
    clip_r, clip_g, clip_b = 66, 133, 244  # #4285F4
    
    # Dark blue color  
    dark_r, dark_g, dark_b = 26, 115, 232  # #1A73E8
    
    # White color for content lines
    white_r, white_g, white_b = 255, 255, 255
    
    # Side panel color
    panel_r, panel_g, panel_b = 232, 240, 254  # #E8F0FE
    
    # Initialize image data with transparent background
    pixels = []
    
    for y in range(height):
        row = []
        for x in range(width):
            # Default transparent background
            r, g, b, a = bg_r, bg_g, bg_b, bg_a
            
            # Calculate scaled positions
            margin = int(20 * scale)
            clip_width = int(60 * scale)
            clip_height = int(80 * scale)
            clip_x = margin
            clip_y = int(16 * scale)
            
            # Check if pixel is inside main clipboard area
            if (clip_x <= x <= clip_x + clip_width and 
                clip_y <= y <= clip_y + clip_height):
                r, g, b, a = clip_r, clip_g, clip_b, 255
                
                # Content lines
                content_x = clip_x + int(8 * scale)
                content_width = int(44 * scale)
                line_height = max(1, int(3 * scale))
                
                # Line positions
                line_y1 = clip_y + int(14 * scale)
                line_y2 = clip_y + int(22 * scale)
                line_y3 = clip_y + int(30 * scale)
                line_y4 = clip_y + int(38 * scale)
                
                # Draw content lines
                if (content_x <= x <= content_x + content_width):
                    if (line_y1 <= y <= line_y1 + line_height or
                        line_y2 <= y <= line_y2 + line_height or
                        line_y3 <= y <= line_y3 + line_height or
                        line_y4 <= y <= line_y4 + line_height):
                        r, g, b, a = white_r, white_g, white_b, 255
            
            # Clipboard clip at top
            clip_clip_width = int(30 * scale)
            clip_clip_height = int(12 * scale)
            clip_clip_x = clip_x + (clip_width - clip_clip_width) // 2
            clip_clip_y = int(8 * scale)
            
            if (clip_clip_x <= x <= clip_clip_x + clip_clip_width and
                clip_clip_y <= y <= clip_clip_y + clip_clip_height):
                r, g, b, a = dark_r, dark_g, dark_b, 255
            
            # Side panel (if there's space)
            panel_x = clip_x + clip_width + int(8 * scale)
            panel_width = int(20 * scale)
            panel_height = int(56 * scale)
            panel_y = clip_y + int(8 * scale)
            
            if (panel_x + panel_width < width and
                panel_x <= x <= panel_x + panel_width and
                panel_y <= y <= panel_y + panel_height):
                r, g, b, a = panel_r, panel_g, panel_b, 255
                
                # Panel content lines
                panel_content_x = panel_x + int(4 * scale)
                panel_content_width = int(12 * scale)
                panel_line_height = max(1, int(2 * scale))
                
                panel_line_y1 = panel_y + int(6 * scale)
                panel_line_y2 = panel_y + int(12 * scale)
                panel_line_y3 = panel_y + int(18 * scale)
                
                if (panel_content_x <= x <= panel_content_x + panel_content_width):
                    if (panel_line_y1 <= y <= panel_line_y1 + panel_line_height or
                        panel_line_y2 <= y <= panel_line_y2 + panel_line_height or
                        panel_line_y3 <= y <= panel_line_y3 + panel_line_height):
                        r, g, b, a = clip_r, clip_g, clip_b, 255
            
            row.extend([r, g, b, a])
        pixels.extend(row)
    
    return create_png_from_rgba(width, height, pixels)

def create_png_from_rgb(width, height, rgb_data):
    """Create PNG file from RGB pixel data"""
    
    def crc32(data):
        return zlib.crc32(data) & 0xffffffff
    
    def write_chunk(chunk_type, data):
        chunk = struct.pack('>I', len(data)) + chunk_type + data
        chunk += struct.pack('>I', crc32(chunk_type + data))
        return chunk
    
    # PNG signature
    png_data = b'\x89PNG\r\n\x1a\n'
    
    # IHDR chunk
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
    png_data += write_chunk(b'IHDR', ihdr_data)
    
    # IDAT chunk - compress the image data
    raw_data = b''
    for y in range(height):
        raw_data += b'\x00'  # Filter type (none)
        start_idx = y * width * 3
        end_idx = start_idx + width * 3
        raw_data += bytes(rgb_data[start_idx:end_idx])
    
    idat_data = zlib.compress(raw_data)
    png_data += write_chunk(b'IDAT', idat_data)
    
    # IEND chunk
    png_data += write_chunk(b'IEND', b'')
    
    return png_data

# Create icons directory if it doesn't exist
os.makedirs('icons', exist_ok=True)

# Create different sizes
sizes = [16, 32, 48, 128]

print("🎨 Creating SideClip PNG icons...")

for size in sizes:
    try:
        png_data = create_sideclip_png(size)
        filename = f'icons/icon{size}.png'
        
        with open(filename, 'wb') as f:
            f.write(png_data)
        
        # Verify file size
        file_size = len(png_data)
        print(f"✅ Created {filename} ({file_size} bytes)")
        
    except Exception as e:
        print(f"❌ Error creating icon{size}.png: {e}")

print("\n🎯 SideClip PNG icons generation complete!")
print("📋 Each icon shows clipboard with side panel design")
print("🎨 Uses proper SideClip color scheme")
