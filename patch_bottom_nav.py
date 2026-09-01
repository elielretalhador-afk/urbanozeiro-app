import re

with open("src/components/BottomNav.tsx", "r") as f:
    content = f.read()

# Replace background and borders
content = content.replace("bg-[#080d14]/98 border-t border-white/10", "bg-[#0b1b42]/98 border-t border-[#1d4ed8]/40")
content = content.replace("from-transparent via-emerald-400/30 to-transparent", "from-transparent via-[#fce803]/30 to-transparent")

# Replace active states (emerald to yellow)
content = content.replace("text-emerald-400", "text-[#fce803]")
content = content.replace("bg-emerald-400", "bg-[#fce803]")
content = content.replace("shadow-[0_0_10px_#00ff66]", "shadow-[0_0_10px_#fce803]")
content = content.replace("bg-emerald-400/15", "bg-[#fce803]/15")
content = content.replace("border-emerald-400/40", "border-[#fce803]/40")
content = content.replace("shadow-[0_0_12px_rgba(0,255,102,0.25)]", "shadow-[0_0_12px_rgba(252,232,3,0.25)]")

with open("src/components/BottomNav.tsx", "w") as f:
    f.write(content)
