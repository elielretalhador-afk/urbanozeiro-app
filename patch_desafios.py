import re

with open("src/components/DesafiosView.tsx", "r") as f:
    content = f.read()

# Replace activeMainTab definition
content = content.replace("useState<'urbanos' | 'diretos' | 'eventos'>(initialTab)", "useState<'urbanos' | 'diretos' | 'eventos' | 'segmentos'>(initialTab)")

# Change grid-cols-2 to grid-cols-3
content = content.replace("grid grid-cols-2 p-1", "grid grid-cols-3 p-1")

# Add the new button for Segmentos
btn = """        <button
          id="tab-toggle-desafios-segmentos"
          type="button"
          onClick={() => setActiveMainTab('segmentos')}
          className={`py-2.5 px-2 rounded-xl text-xs font-bold uppercase font-mono-stat tracking-wider transition-all flex items-center justify-center gap-1.5 relative cursor-pointer ${
            activeMainTab === 'segmentos'
              ? 'bg-indigo-400 text-black font-black shadow-[0_0_15px_rgba(99,102,241,0.4)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Route className="w-3.5 h-3.5" />
          <span className="truncate">SPRINTS</span>
        </button>"""

content = content.replace("<button\n          id=\"tab-toggle-desafios-diretos\"", btn + "\n\n        <button\n          id=\"tab-toggle-desafios-diretos\"")

# Add the View for Segmentos
view = """      {/* VIEW: SEGMENTOS */}
      {activeMainTab === 'segmentos' && (
        <SegmentsHub onSelectSegmentOnMap={onSelectZoneOnMap} />
      )}

      {/* VIEW: DIRECT CHALLENGES (X1) */}"""

content = content.replace("{/* VIEW: DIRECT CHALLENGES (X1) */}", view)

# Add imports
imports = """import { Route } from 'lucide-react';
import { SegmentsHub } from './SegmentsHub';
"""
if "import { Route" not in content:
    content = content.replace("import { Swords, Trophy } from 'lucide-react';", "import { Swords, Trophy, Route } from 'lucide-react';")
    content = content.replace("import { EventsHub } from './EventsHub';", "import { EventsHub } from './EventsHub';\nimport { SegmentsHub } from './SegmentsHub';")

with open("src/components/DesafiosView.tsx", "w") as f:
    f.write(content)

