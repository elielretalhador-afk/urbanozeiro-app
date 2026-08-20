const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const listenerCode = `    const handleOnline = () => {
      console.log('Conexão restabelecida! Processando fila de sincronização...');
      DatabaseService.processSyncQueue().catch(console.error);
    };
    window.addEventListener('online', handleOnline);

    DatabaseService.initializeApp().then(data => {`;

content = content.replace(
  /DatabaseService\.initializeApp\(\)\.then\(data => \{/,
  listenerCode
);

const returnCode = `      setDbError(err.message || 'Error initializing DB');
    });

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);`;

content = content.replace(
  /setDbError\(err\.message \|\| 'Error initializing DB'\);\n\s*\}\);\n\s*\}, \[\]\);/,
  returnCode
);

fs.writeFileSync('src/App.tsx', content);
