const fs = require('fs');

const files = [
  'src/components/ClanLeaderboardModal.tsx',
  'src/components/ClanProfileModal.tsx',
  'src/components/CreateClanModal.tsx',
  'src/components/JoinClanModal.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/  return \(\n    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">\n      <div \n        className="absolute inset-0 bg\[#05070a\]\/90 backdrop-blur-md" \n        onClick={onClose}\n      \/>\n      \n      <div className="relative w-full max-w-md bg\[#080B0E\] border border-white\/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col p-6 text-center">\n        <button\n          onClick={onClose}\n          className="absolute top-4 right-4 p-2 rounded-xl bg-white\/5 hover:bg-white\/10 text-slate-300 transition-colors"\n        >\n          <X className="w-5 h-5" \/>\n        <\/button>\n\n        <div className="w-16 h-16 rounded-2xl bg-indigo-500\/10 text-indigo-400 border border-indigo-500\/30 flex items-center justify-center text-3xl mx-auto mb-4 mt-6">\n          🚧\n        <\/div>\n        <h2 className="text-xl font-black text-white font-display uppercase tracking-tight mb-2">\n          (Guerra de Clãs|Clãs)\n        <\/h2>\n        <p className="text-sm font-medium text-slate-400 mb-6">\n          Em breve\.\n        <\/p>\n      <\/div>\n    <\/div>\n  \);\n/g, '');
  fs.writeFileSync(file, content);
});
console.log("Fixed files");
