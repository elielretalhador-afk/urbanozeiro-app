const fs = require('fs');
let content = fs.readFileSync('src/components/FeedView.tsx', 'utf8');

// Rename Props
content = content.replace(/interface ActivityFeedModalProps/g, 'export interface FeedViewProps');
content = content.replace(/export const ActivityFeedModal: React\.FC<ActivityFeedModalProps>/g, 'export const FeedView: React.FC<FeedViewProps>');

// Remove isOpen
content = content.replace(/isOpen,\s*/g, '');
content = content.replace(/if \(!isOpen\) return null;/g, '');

// Swap the modal wrapper with a full div
const oldWrapper = `    <div
      id="activity-feed-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col bg-[#070b10] border-2 border-emerald-500/40 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.9)] overflow-hidden text-white">`;

const newWrapper = `    <div
      id="social-feed-view"
      className="absolute inset-0 w-full h-full flex flex-col bg-[#080B0E] text-white z-20"
    >
      <div className="relative w-full h-full flex flex-col bg-[#070b10] overflow-hidden text-white">`;

content = content.replace(oldWrapper, newWrapper);

// Change text "CENTRAL DE ATIVIDADES" to "FEED SOCIAL"
content = content.replace(/CENTRAL DE ATIVIDADES/g, 'FEED SOCIAL');
content = content.replace(/<span className="px-1\.5 py-0\.5 rounded bg-emerald-400\/20 text-emerald-300 border border-emerald-400\/40 text-\[9px\] font-mono-stat font-bold">\s*FEED\s*<\/span>/, '');

fs.writeFileSync('src/components/FeedView.tsx', content, 'utf8');
console.log('Rewritten FeedView.');
