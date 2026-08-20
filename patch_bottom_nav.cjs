const fs = require('fs');
let content = fs.readFileSync('src/components/BottomNav.tsx', 'utf8');

// Add onOpenFeed to props
content = content.replace(
  /interface BottomNavProps \{/,
  `interface BottomNavProps {\n  onOpenFeed?: () => void;`
);

content = content.replace(
  /export const BottomNav: React\.FC<BottomNavProps> = \(\{ activeTab, onChangeTab \}\) => \{/,
  `export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab, onOpenFeed }) => {`
);

// Add Activity icon import
content = content.replace(
  /import \{ Map, Navigation, Trophy, Swords, User \} from 'lucide-react';/,
  `import { Map, Navigation, Trophy, Swords, User, Activity } from 'lucide-react';`
);

// Add FEED to the tabs array, but handle it specially so it doesn't change activeTab if it's the feed
content = content.replace(
  /const tabs = \[[\s\S]*?\];/,
  `const tabs = [
    { id: 'mapa' as TabType, label: 'MAPA', icon: Map },
    { id: 'rotas' as TabType, label: 'ROTAS', icon: Navigation },
    { id: 'feed' as any, label: 'FEED', icon: Activity },
    { id: 'ranking' as TabType, label: 'RANKING', icon: Trophy },
    { id: 'desafios' as TabType, label: 'DESAFIOS', icon: Swords },
    { id: 'perfil' as TabType, label: 'PERFIL', icon: User },
  ];`
);

content = content.replace(
  /onClick=\{\(\) => onChangeTab\(tab\.id\)\}/,
  `onClick={() => {
                if (tab.id === 'feed' && onOpenFeed) {
                  onOpenFeed();
                } else {
                  onChangeTab(tab.id as TabType);
                }
              }}`
);

fs.writeFileSync('src/components/BottomNav.tsx', content);
console.log('Patched BottomNav.tsx');
