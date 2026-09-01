with open('src/App.tsx', 'r') as f:
    content = f.read()

target1 = "  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);"
replacement1 = """  const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => {
    return localStorage.getItem('urbanozeiro_onboardingCompleted') !== 'true';
  });"""
content = content.replace(target1, replacement1)

target2 = "  const handleUpdateTutorial = (state: any) => { setTutorialState(state); };"
replacement2 = """  const handleUpdateTutorial = (state: any) => { 
    setTutorialState(state);
    if (state.isSkipped || state.isCompleted) {
      localStorage.setItem('urbanozeiro_onboardingCompleted', 'true');
    }
  };
  
  const handleOnboardingAction = (action: 'explore_map' | 'start_activity' | 'go_hub') => {
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
content = content.replace(target2, replacement2)

target3 = """        <OnboardingModal
          isOpen={isOnboardingOpen}
          onClose={() => setIsOnboardingOpen(false)}
          tutorialState={tutorialState}
          onUpdateTutorial={handleUpdateTutorial}
        />"""
replacement3 = """        <OnboardingModal
          isOpen={isOnboardingOpen}
          onClose={() => setIsOnboardingOpen(false)}
          tutorialState={tutorialState}
          onUpdateTutorial={handleUpdateTutorial}
          onAction={handleOnboardingAction}
        />"""
content = content.replace(target3, replacement3)

with open('src/App.tsx', 'w') as f:
    f.write(content)
