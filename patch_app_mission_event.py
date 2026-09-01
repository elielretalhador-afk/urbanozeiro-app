import sys

with open('src/App.tsx', 'r') as f:
    content = f.read()

new_effect = """
  useEffect(() => {
    const handleMissionCompleted = (e: any) => {
      const { title, xp, clanId } = e.detail;
      // We could check if it's our clan, but if we triggered it, it likely is.
      const notifData = {
        type: 'system' as const,
        title: '🏆 MISSÃO CONCLUÍDA',
        message: `Seu Clã concluiu "${title}" e recebeu +${xp} XP.`,
      };
      
      const newNotif = {
        ...notifData,
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timeAgo: 'Agora mesmo',
        isRead: false,
        timestamp: new Date().toISOString(),
      };
      setNotifications((prev) => [newNotif, ...prev]);
      showToast(`🏆 MISSÃO DO CLÃ: ${title} CONCLUÍDA! +${xp} XP`);
    };

    window.addEventListener('clan-mission-completed', handleMissionCompleted);
    return () => window.removeEventListener('clan-mission-completed', handleMissionCompleted);
  }, []);
"""

content = content.replace("const handleNotificationAction = (notification: AppNotification) => {", new_effect + "\n  const handleNotificationAction = (notification: AppNotification) => {")

with open('src/App.tsx', 'w') as f:
    f.write(content)
