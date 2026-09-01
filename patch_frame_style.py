import sys

with open('src/data/progressionData.ts', 'r') as f:
    content = f.read()

content = content.replace("    case 'inv_frm_01': // Neon Pulse", "    case 'frame_gold':\n      return {\n        borderClass: 'border-2 border-yellow-400',\n        glowClass: 'shadow-[0_0_20px_rgba(252,232,3,0.5)] ring-2 ring-yellow-400/50 ring-offset-2 ring-offset-black',\n        badgeClass: 'bg-yellow-400 text-black',\n      };\n    case 'inv_frm_01': // Neon Pulse")

with open('src/data/progressionData.ts', 'w') as f:
    f.write(content)

