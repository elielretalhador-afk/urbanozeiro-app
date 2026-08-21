const fs = require('fs');
let content = fs.readFileSync('src/components/PublicProfileModal.tsx', 'utf8');

// Add onMessage to props
content = content.replace(
  'onToggleFollow?: (userId: string) => void;',
  'onToggleFollow?: (userId: string) => void;\n  onMessage?: (userId: string) => void;'
);

content = content.replace(
  '{/* Follow Button */}',
  `{/* Message Button */}
              {onMessage && (
                <button
                  type="button"
                  id="btn-social-message"
                  onClick={() => onMessage(player.id || 'usr_unknown')}
                  className="col-span-2 py-2 px-3 mb-1 rounded-xl font-bold text-xs uppercase font-mono-stat tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-blue-500/20 border border-blue-400/50 text-blue-300 hover:bg-blue-500/30"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                  <span>MENSAGEM</span>
                </button>
              )}
              {/* Follow Button */}`
);

// Add MessageSquare import
if (!content.includes('MessageSquare')) {
  content = content.replace(
    'import { X, Shield, MapPin, Zap, UserPlus, Flame, Users, Calendar, AlertTriangle, UserMinus, ShieldAlert, BadgeCheck, Disc, Settings, Flag, Swords, ChevronDown, UserCheck, Clock } from \'lucide-react\';',
    'import { X, Shield, MapPin, Zap, UserPlus, Flame, Users, Calendar, AlertTriangle, UserMinus, ShieldAlert, BadgeCheck, Disc, Settings, Flag, Swords, ChevronDown, UserCheck, Clock, MessageSquare } from \'lucide-react\';'
  );
}

fs.writeFileSync('src/components/PublicProfileModal.tsx', content, 'utf8');
console.log('PublicProfileModal updated with Message button');
