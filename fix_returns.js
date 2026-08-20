const fs = require('fs');

const files = [
  'src/components/ClanProfileModal.tsx',
  'src/components/CreateClanModal.tsx',
  'src/components/JoinClanModal.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Simple heuristic: if we see a `case '...':` followed by `<` or `      <`, we inject `return (`
  content = content.replace(/case '([^']+)':\n(\s*)</g, "case '$1':\n$2return (\n$2<");
  // Also we need to inject the main component return. We can look for the main JSX block `<div`
  // Actually, I'll just restore the whole file manually or using regex.
});
