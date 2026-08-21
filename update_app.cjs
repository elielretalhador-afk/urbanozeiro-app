const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldStr = `        {/* Modal: Central de Atividades & Feed Urbanozeiro */}
        {activeTab === 'feed' && (
        <FeedView`;

const newStr = `        {/* Modal: Central de Atividades & Feed Urbanozeiro */}
        {activeTab === 'feed' && (
        <FeedView
          onClose={() => setActiveTab('mapa')}`;

content = content.replace(oldStr, newStr);

// Also remove onOpenAchievements from FeedView in App.tsx if it exists
content = content.replace(/\s*onOpenAchievements=\{.*?\}\}/s, '');

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('App.tsx updated');
