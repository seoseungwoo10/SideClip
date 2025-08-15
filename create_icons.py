import base64
import os
from PIL import Image, ImageDraw, ImageFont

def create_sideclip_icon(size):
    """Create SideClip icon with clipboard and side panel design"""
    # Create a new image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Color scheme - modern blue gradient
    primary_color = '#4285F4'  # Google Blue
    secondary_color = '#1A73E8'  # Darker blue
    accent_color = '#FFFFFF'
    
    # Calculate dimensions based on size
    margin = size // 8
    clipboard_width = size - (margin * 2)
    clipboard_height = int(clipboard_width * 1.2)
    
    # Position clipboard in center
    clip_x = margin
    clip_y = (size - clipboard_height) // 2
    
    # Draw clipboard background (rounded rectangle)
    draw.rounded_rectangle(
        [clip_x, clip_y, clip_x + clipboard_width, clip_y + clipboard_height],
        radius=size//16,
        fill=primary_color,
        outline=secondary_color,
        width=max(1, size//32)
    )
    
    # Draw clipboard clip at top
    clip_width = clipboard_width // 3
    clip_height = size // 8
    clip_center_x = clip_x + clipboard_width // 2
    clip_top_y = clip_y - clip_height // 2
    
    draw.rounded_rectangle(
        [clip_center_x - clip_width//2, clip_top_y, 
         clip_center_x + clip_width//2, clip_top_y + clip_height],
        radius=size//32,
        fill=secondary_color
    )
    
    # Draw side panel indicator (vertical lines on the right)
    panel_x = clip_x + clipboard_width + size//16
    panel_width = size//8
    panel_height = clipboard_height * 0.7
    panel_y = clip_y + (clipboard_height - panel_height) // 2
    
    if panel_x + panel_width < size:
        # Draw 3 horizontal lines to represent side panel content
        line_height = max(1, size//24)
        line_spacing = panel_height // 4
        
        for i in range(3):
            line_y = panel_y + i * line_spacing
            draw.rectangle(
                [panel_x, line_y, panel_x + panel_width, line_y + line_height],
                fill=accent_color
            )
    
    # Draw clipboard content lines
    line_margin = clipboard_width // 4
    content_x = clip_x + line_margin
    content_width = clipboard_width - (line_margin * 2)
    content_start_y = clip_y + clipboard_height // 4
    
    line_height = max(1, size//32)
    line_spacing = size//12
    
    # Draw 3-4 content lines
    num_lines = 3 if size <= 32 else 4
    for i in range(num_lines):
        line_y = content_start_y + i * line_spacing
        # Vary line widths for realistic look
        line_width = content_width if i < 2 else content_width * 0.7
        
        if line_y + line_height < clip_y + clipboard_height - margin:
            draw.rectangle(
                [content_x, line_y, content_x + line_width, line_y + line_height],
                fill=accent_color
            )
    
    return img

# Create icons directory if it doesn't exist
os.makedirs('icons', exist_ok=True)

# Create different sizes
sizes = [16, 32, 48, 128]

for size in sizes:
    icon = create_sideclip_icon(size)
    icon.save(f'icons/icon{size}.png', 'PNG')
    print(f"Created icon{size}.png")

print("✅ SideClip icons created successfully!")
print("📋 Icons feature a clipboard with side panel design")
print("🎨 Uses modern blue color scheme (#4285F4)")
