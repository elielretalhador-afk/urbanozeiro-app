import sys

with open('src/App.tsx', 'r') as f:
    content = f.read()

# I need to add EconomyService import
if "EconomyService" not in content:
    content = content.replace("import { AuthService } from './services/auth';", "import { AuthService } from './services/auth';\nimport { EconomyService } from './services/economyService';")

# I need to add a useEffect to subscribe to ProfileCosmetics
effect = """
  useEffect(() => {
    if (user.id && user.id !== 'usr_me') {
      const unsub = EconomyService.subscribeToEquippedCosmetics(user.authId || user.id, (cosmetics) => {
        if (cosmetics) {
          setUser(prev => ({ ...prev, profileCosmetics: cosmetics }));
        }
      });
      return () => unsub();
    }
  }, [user.id, user.authId]);
"""

if "subscribeToEquippedCosmetics" not in content:
    # let's inject it after the useEffect for AuthState
    content = content.replace("  // =========================================================================", effect + "\n  // =========================================================================")

with open('src/App.tsx', 'w') as f:
    f.write(content)
