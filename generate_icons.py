from PIL import Image, ImageDraw

def create_icon(size, filename):
    img = Image.new('RGBA', (size, size), '#080B0E')
    draw = ImageDraw.Draw(img)
    # Draw yellow circle
    margin = size * 0.1
    draw.ellipse([margin, margin, size - margin, size - margin], outline='#fce803', width=int(size * 0.05))
    # Draw blue inner circle
    margin2 = size * 0.2
    draw.ellipse([margin2, margin2, size - margin2, size - margin2], outline='#1d4ed8', width=int(size * 0.02))
    
    # Just save it
    img.save(filename)

create_icon(192, 'public/icon-192.png')
create_icon(512, 'public/icon-512.png')
print("Icons generated")
