import re

with open("src/components/SegmentDetailsModal.tsx", "r") as f:
    content = f.read()

# Add AuthService
if "import { AuthService } from" not in content:
    content = content.replace("import { DatabaseService } from '../services/db';", "import { DatabaseService } from '../services/db';\nimport { AuthService } from '../services/auth';")

# Add state for current user position
if "const [userPos, setUserPos] = useState" not in content:
    content = content.replace("const [loading, setLoading] = useState(true);", "const [loading, setLoading] = useState(true);\n  const [userPos, setUserPos] = useState<number | null>(null);")

# Find position in load function
old_load = """      const attempts = await DatabaseService.getSegmentAttempts(segmentId, 10);
      setTop10(attempts);
      setLoading(false);"""

new_load = """      const attempts = await DatabaseService.getSegmentAttempts(segmentId, 10);
      setTop10(attempts);
      
      const user = await AuthService.getCurrentUser();
      if (user) {
         const pos = attempts.findIndex(a => a.playerId === user.id);
         if (pos !== -1) {
            setUserPos(pos + 1);
         }
      }
      setLoading(false);"""

content = content.replace(old_load, new_load)

# Display position
old_display = """                 <h3 className="text-sm font-black text-white uppercase tracking-wider mb-3 font-display">Hall da Fama (Top 10)</h3>"""
new_display = """                 <div className="flex items-center justify-between mb-3">
                   <h3 className="text-sm font-black text-white uppercase tracking-wider font-display">Hall da Fama (Top 10)</h3>
                   {userPos !== null ? (
                     <div className="text-[10px] text-emerald-400 font-mono-stat border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 rounded">Sua posição: #{userPos}</div>
                   ) : (
                     <div className="text-[9px] text-slate-500 font-mono-stat">Posição individual ainda depende de consulta específica.</div>
                   )}
                 </div>"""

content = content.replace(old_display, new_display)

with open("src/components/SegmentDetailsModal.tsx", "w") as f:
    f.write(content)

