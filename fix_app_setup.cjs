const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add import
content = content.replace(/import \{ FeedView \} from '\.\/components\/FeedView';/, "import { FeedView } from './components/FeedView';\nimport { EquipmentSetupModal } from './components/EquipmentSetupModal';");

// Add state
content = content.replace(/const \[isSettingsModalOpen, setIsSettingsModalOpen\] = useState\(false\);/, "const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);\n  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);");

// Add event listener in useEffect for open-equipment-modal
const effectStr = `  useEffect(() => {
    const handleOpenEq = () => setIsEquipmentModalOpen(true);
    window.addEventListener('open-equipment-modal', handleOpenEq);
    return () => window.removeEventListener('open-equipment-modal', handleOpenEq);
  }, []);`;
content = content.replace(/useEffect\(\(\) => \{\n    if \(user && user.id\)/, effectStr + "\n  useEffect(() => {\n    if (user && user.id)");

// Render modal
const renderModal = `        {/* Modal: Equipment Setup */}
        <EquipmentSetupModal
          isOpen={isEquipmentModalOpen}
          onClose={() => setIsEquipmentModalOpen(false)}
          currentUser={user}
          onSave={(setup) => {
             const newUser = { ...user, skateSetup: setup };
             setUser(newUser);
             showToast('Equipamento atualizado com sucesso!');
          }}
        />`;

content = content.replace(/\{(\/\* Modal: Central de Notificações \*\/)/, renderModal + "\n\n        {$1");

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Fixed App.tsx for equipment');
