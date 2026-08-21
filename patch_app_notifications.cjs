const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const effect = `  // Subscrever às notificações do Firebase
  useEffect(() => {
    let unsubscribe: any;
    if (user && user.id) {
      unsubscribe = SocialService.subscribeToNotifications(user.id, (fbNotifs) => {
        // Converte as notificações do firebase para AppNotification e atualiza o estado
        const formattedNotifs = fbNotifs.map(fn => ({
          id: fn.id,
          type: (fn.type === 'new_follower' || fn.type === 'friend_request' || fn.type === 'friend_accept') ? 'social' : fn.type === 'new_message' ? 'mensagem' : 'sistema',
          title: fn.type === 'new_follower' ? 'Novo Seguidor' : fn.type === 'friend_request' ? 'Pedido de Amizade' : fn.type === 'friend_accept' ? 'Amizade Aceita' : 'Nova Notificação',
          message: \`\${fn.senderName} \${fn.message}\`,
          timeAgo: 'Recente',
          isRead: fn.read,
          actionType: fn.type.startsWith('friend') ? 'open_social_hub' : undefined,
          actionPayload: { tab: 'amigos' }
        }));
        
        setNotifications(prev => {
          // Merge avoiding duplicates (we just keep the firebase ones for social, or merge them)
          // For simplicity, we can prepend the new ones that don't exist.
          const currentIds = new Set(prev.map(p => p.id));
          const toAdd = formattedNotifs.filter(fn => !currentIds.has(fn.id));
          
          if (toAdd.length === 0) {
             // Maybe some were updated (read state)
             return prev.map(p => {
               const fnUpdate = formattedNotifs.find(fn => fn.id === p.id);
               return fnUpdate ? { ...p, isRead: fnUpdate.isRead } : p;
             });
          }
          
          return [...toAdd, ...prev];
        });
      });
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user?.id]);
`;

if (!content.includes('Subscrever às notificações do Firebase')) {
  content = content.replace(
    '// =========================================================================\n  // NOTIFICATIONS & MESSAGES',
    effect + '\n  // =========================================================================\n  // NOTIFICATIONS & MESSAGES'
  );
}

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('App patched with real-time notifications');
