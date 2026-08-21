const fs = require('fs');
let content = fs.readFileSync('src/components/FeedView.tsx', 'utf8');

// 1. Remove onClose requirement
content = content.replace(/onClose:\s*\(\)\s*=>\s*void;/, 'onClose?: () => void;');
content = content.replace(/export const FeedView: React\.FC<FeedViewProps> = \(\{/, 'export const FeedView: React.FC<FeedViewProps> = ({ onClose,');

// 2. Change filters
const filterReplacement = `  const filters: { id: ActivityFilterType; label: string; icon: React.ElementType }[] = [
    { id: 'TODAS', label: 'TODAS', icon: Layers },
    { id: 'AMIGOS', label: 'AMIGOS', icon: Users },
    { id: 'SEGUINDO', label: 'SEGUINDO', icon: Compass },
    { id: 'MINHAS_ATIVIDADES', label: 'MINHAS', icon: User },
    { id: 'DESAFIOS', label: 'DESAFIOS', icon: Swords },
    { id: 'EVENTOS', label: 'EVENTOS', icon: Calendar },
  ];`;
content = content.replace(/const filters:[\s\S]*?\];/, filterReplacement);
// Wait, the User icon might not be imported, I need to make sure User is imported from lucide-react.
content = content.replace(/import \{([\s\S]*?)X,([\s\S]*?)\} from 'lucide-react';/, "import {$1X, User,$2} from 'lucide-react';");

// 3. Change absolute inset-0 z-[100] to w-full h-full
content = content.replace(/className="absolute inset-0 w-full h-full flex flex-col bg-\[#080B0E\] text-white z-\[100\]"/, 'className="w-full h-full flex flex-col bg-[#070b10] text-white"');
// Change Title
content = content.replace(/<h3 className="text-base font-black text-white font-display uppercase tracking-wider">\s*FEED SOCIAL\s*<\/h3>/, '<h3 className="text-base font-black text-white font-display uppercase tracking-wider">FEED</h3>');
// Remove close button
content = content.replace(/<button onClick=\{onClose\}[\s\S]*?<\/button>/, '');

// 4. Add Post Creation Box after Header
const postCreationBox = `
        {/* Post Creation Box */}
        <div className="p-4 bg-[#0d141e] border-b border-white/10 flex gap-3">
          <img src={currentUser.avatar} alt="Avatar" className="w-10 h-10 rounded-full border border-white/20 object-cover" />
          <div className="flex-1 flex flex-col gap-3">
             <input type="text" placeholder="O que você está pensando?" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400/50" />
             <div className="flex items-center gap-3">
                <button className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold hover:opacity-80 transition-opacity">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                   Foto
                </button>
                <button className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold hover:opacity-80 transition-opacity">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect width="15" height="14" x="1" y="5" rx="2" ry="2"/></svg>
                   Vídeo
                </button>
             </div>
          </div>
        </div>
`;
content = content.replace(/(<\/div>\s*\{\/\* Header \*\/\s*[\s\S]*?<\/div>\s*<\/div>\s*<\/div>)/, '$1' + postCreationBox);

fs.writeFileSync('src/components/FeedView.tsx', content, 'utf8');
console.log('Fixed FeedView');
