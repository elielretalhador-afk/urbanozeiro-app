const fs = require('fs');

let content = fs.readFileSync('src/components/PublicProfileModal.tsx', 'utf8');

// Add props
content = content.replace(
  /onBlockPlayer\?: \(playerId: string\) => void;/,
  `onBlockPlayer?: (playerId: string) => void;\n  onOpenFollowers?: () => void;\n  onOpenFollowing?: () => void;`
);

// Destructure new props
content = content.replace(
  /onBlockPlayer,/,
  `onBlockPlayer,\n  onOpenFollowers,\n  onOpenFollowing,`
);

// Add cursor-pointer and onClick to Followers counter
content = content.replace(
  /<div className="grid grid-cols-2 gap-2 mt-3 p-2 rounded-2xl bg-black\/40 border border-white\/5 text-center">/,
  `<div className="grid grid-cols-2 gap-2 mt-3 p-2 rounded-2xl bg-black/40 border border-white/5 text-center">`
);

content = content.replace(
  /<div>\s*<span className="text-sm font-black text-white font-mono-stat">\{followersCount\}<\/span>\s*<span className="text-\[10px\] text-slate-400 font-bold uppercase font-mono-stat block">\s*Seguidores\s*<\/span>\s*<\/div>/,
  `<div onClick={onOpenFollowers} className="cursor-pointer hover:bg-white/5 rounded-xl transition-colors py-1">
              <span className="text-sm font-black text-white font-mono-stat">{followersCount}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase font-mono-stat block">
                Seguidores
              </span>
            </div>`
);

content = content.replace(
  /<div>\s*<span className="text-sm font-black text-white font-mono-stat">\{followingCount\}<\/span>\s*<span className="text-\[10px\] text-slate-400 font-bold uppercase font-mono-stat block">\s*Seguindo\s*<\/span>\s*<\/div>/,
  `<div onClick={onOpenFollowing} className="cursor-pointer hover:bg-white/5 rounded-xl transition-colors py-1">
              <span className="text-sm font-black text-white font-mono-stat">{followingCount}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase font-mono-stat block">
                Seguindo
              </span>
            </div>`
);


fs.writeFileSync('src/components/PublicProfileModal.tsx', content);
console.log('Patched PublicProfileModal');
