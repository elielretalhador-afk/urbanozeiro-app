with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """  const handleOnboardingAction = (action: 'explore_map' | 'start_activity' | 'go_hub') => {
    if (action === 'explore_map') {
      setActiveTab('mapa');
    } else if (action === 'start_activity') {
      setActiveTab('mapa');
      const event = new CustomEvent('app_start_activity');
      window.dispatchEvent(event);
    } else if (action === 'go_hub') {
      setActiveTab('perfil');
    }
  };"""

replacement = """  const handleOnboardingAction = (action: 'explore_map' | 'start_activity' | 'go_hub') => {
    if (action === 'explore_map') {
      setActiveTab('mapa');
    } else if (action === 'start_activity') {
      setActiveTab('mapa');
      handleStartSession();
    } else if (action === 'go_hub') {
      setActiveTab('perfil');
    }
  };"""

content = content.replace(target, replacement)

with open('src/App.tsx', 'w') as f:
    f.write(content)
