with open('src/App.tsx', 'r') as f:
    content = f.read()

target = "  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);"
replacement = """  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  useEffect(() => {
    const handleNotificationAction = (e: any) => {
      const data = e.detail;
      if (!data) return;
      
      // Deep Linking based on payload
      if (data.type === 'zone_lost') {
        setActiveTab('mapa');
        if (data.entityId) {
          // Focus zone on map if needed
          const event = new CustomEvent('focus-zone', { detail: data.entityId });
          window.dispatchEvent(event);
        }
      } else if (data.type === 'clan_invite') {
        setActiveTab('perfil');
        // Might need a sub-tab
      } else if (data.type === 'season_finished') {
        setActiveTab('missoes'); // Or rankings
      }
    };

    window.addEventListener('app_notification_action', handleNotificationAction);
    return () => window.removeEventListener('app_notification_action', handleNotificationAction);
  }, []);
"""

content = content.replace(target, replacement)

with open('src/App.tsx', 'w') as f:
    f.write(content)
