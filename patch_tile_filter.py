import os

css_path = 'src/index.css'
with open(css_path, 'r') as f:
    css_content = f.read()

# Remove the bad .leaflet-tile-pane rule from the previous attempt
old_rule = ".leaflet-tile-pane {\n  filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);\n  -webkit-backface-visibility: hidden;\n  backface-visibility: hidden;\n  transform: translate3d(0,0,0);\n}"
if old_rule in css_content:
    css_content = css_content.replace(old_rule, "")

# Add the correct rule to the individual leaf nodes (images)
new_rule = """
/* Fix GPU Glitch: Apply filter to the 256x256 image tiles, NOT the giant parent containers */
.leaflet-tile {
  filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
}
"""

if ".leaflet-tile {" not in css_content:
    css_content += new_rule

with open(css_path, 'w') as f:
    f.write(css_content)

print("Tile filter patched successfully!")
