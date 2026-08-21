const fs = require('fs');
let content = fs.readFileSync('src/components/FeedView.tsx', 'utf8');

// Add onClose back to props
content = content.replace(/export interface FeedViewProps {/, 'export interface FeedViewProps {\n  onClose: () => void;');
content = content.replace(/export const FeedView: React.FC<FeedViewProps> = \({/, 'export const FeedView: React.FC<FeedViewProps> = ({\n  onClose,');

// Add Back button to Header
const headerTarget = `<h3 className="text-base font-black text-white font-display uppercase tracking-wider">`;
const headerReplacement = `<button onClick={onClose} className="p-1.5 -ml-1.5 mr-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <h3 className="text-base font-black text-white font-display uppercase tracking-wider">`;
content = content.replace(headerTarget, headerReplacement);

// Render conditionally in App if isActivityFeedOpen
fs.writeFileSync('src/components/FeedView.tsx', content, 'utf8');
console.log('Added back button.');
