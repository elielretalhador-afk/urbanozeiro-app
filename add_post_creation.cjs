const fs = require('fs');
let content = fs.readFileSync('src/components/FeedView.tsx', 'utf8');

const target = `{/* Activity List */}`;
const replacement = `{/* Post Creation Area */}
        <div className="p-4 bg-[#0d141e] border-b border-white/5 shrink-0">
          <div className="flex gap-3">
            <img 
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'} 
              className="w-10 h-10 rounded-full border border-slate-700 object-cover" 
              alt="Avatar" 
            />
            <div className="flex-1 flex flex-col gap-2">
              <input 
                type="text" 
                placeholder="O que você está pensando, patinador?" 
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-300 font-medium font-display transition-colors">
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Foto</span>
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-300 font-medium font-display transition-colors">
                    <ActivityIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Compartilhar Patinação</span>
                  </button>
                </div>
                <button className="px-4 py-1.5 rounded-lg bg-emerald-500 text-black font-black text-xs uppercase tracking-wider hover:bg-emerald-400 transition-colors">
                  Publicar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Activity List */}`;

content = content.replace(target, replacement);

// We need to add ImageIcon to imports
content = content.replace("import { Eye, Users, Lock, Compass, UserPlus, Heart, MessageSquare, Share2, Award, Zap, Swords, MapPin, Activity as ActivityIcon, X, Trophy } from 'lucide-react';", 
"import { Eye, Users, Lock, Compass, UserPlus, Heart, MessageSquare, Share2, Award, Zap, Swords, MapPin, Activity as ActivityIcon, X, Trophy, Image as ImageIcon } from 'lucide-react';");

fs.writeFileSync('src/components/FeedView.tsx', content, 'utf8');
console.log('Added post creation area.');
