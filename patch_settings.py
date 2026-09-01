with open('src/App.tsx', 'r') as f:
    content = f.read()

old_handler = "const handleUpdatePlayerSettings = (settings: any) => { setPlayerSettings(settings); showToast('Configurações atualizadas!'); };"
new_handler = """const handleUpdatePlayerSettings = (settings: any) => { 
    setPlayerSettings(settings); 
    showToast('Configurações atualizadas!'); 
    if (user && user.id && settings.notifications) {
      NotificationService.updatePreferences(user.id, settings.notifications);
    }
  };"""

content = content.replace(old_handler, new_handler)

with open('src/App.tsx', 'w') as f:
    f.write(content)
