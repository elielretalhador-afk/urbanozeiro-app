const fs = require('fs');
let content = fs.readFileSync('src/components/PublicProfileModal.tsx', 'utf8');

if (!content.includes('MessageSquare')) {
  content = content.replace(
    'import { X, Shield, MapPin, Zap, UserPlus, Flame, Users, Calendar, AlertTriangle, UserMinus, ShieldAlert, BadgeCheck, Disc, Settings, Flag, Swords, ChevronDown, UserCheck, Clock } from \'lucide-react\';',
    'import { X, Shield, MapPin, Zap, UserPlus, Flame, Users, Calendar, AlertTriangle, UserMinus, ShieldAlert, BadgeCheck, Disc, Settings, Flag, Swords, ChevronDown, UserCheck, Clock, MessageSquare } from \'lucide-react\';'
  );
}

// Add onMessage to props if not there correctly
if (!content.includes('onMessage?: (userId: string) => void;')) {
    content = content.replace(
      'interface PublicProfileModalProps {',
      'interface PublicProfileModalProps {\n  onMessage?: (userId: string) => void;'
    );
}

// Ensure component destructures onMessage
if (!content.match(/onToggleFollow,[\s\n]*onMessage,/)) {
    content = content.replace(
      'onToggleFollow,',
      'onToggleFollow,\n  onMessage,'
    );
}

fs.writeFileSync('src/components/PublicProfileModal.tsx', content, 'utf8');
console.log('PublicProfileModal fixed');
