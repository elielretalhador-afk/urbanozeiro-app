import sys

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add import
if "import { ClanService }" not in content:
    content = content.replace("import { SocialService } from './services/social';", "import { SocialService } from './services/social';\nimport { ClanService } from './services/clan';")

# Update loadSocialData
old_load = """  const loadSocialData = async () => {
    if (user && user.id) {
      const players = await SocialService.getAllPlayers(user.id);
      setSocialPlayers(players);
    }
  };"""

new_load = """  const loadSocialData = async () => {
    if (user && user.id) {
      const players = await SocialService.getAllPlayers(user.id);
      setSocialPlayers(players);
      try {
        const allClans = await ClanService.getAllClans();
        setClans(allClans);
        const myClan = await ClanService.getMyClan(user.authId || user.id);
        setUserClan(myClan);
      } catch(e) {
        console.error("Erro ao carregar clãs", e);
      }
    }
  };"""

content = content.replace(old_load, new_load)

# Update handleCreateClan
old_create = "  const handleCreateClan = (data: any) => { showToast('Clã criado com sucesso!'); setIsCreateClanModalOpen(false); };"
new_create = """  const handleCreateClan = async (data: any) => {
    try {
      if (user) {
        await ClanService.createClan(data.name, data.icon || '⚡', user.authId || user.id, user.name || user.username);
        showToast('Clã criado com sucesso!');
        setIsCreateClanModalOpen(false);
        loadSocialData();
      }
    } catch (e: any) {
      showToast(e.message || 'Erro ao criar clã.');
    }
  };"""
content = content.replace(old_create, new_create)

# Update handleLeaveClan
old_leave = "  const handleLeaveClan = () => { showToast('Você saiu do clã.'); };"
new_leave = """  const handleLeaveClan = async (clanId: string) => {
    try {
      if (user) {
        await ClanService.leaveClan(clanId, user.authId || user.id);
        showToast('Você saiu do clã.');
        setSelectedClanProfile(null);
        loadSocialData();
      }
    } catch (e: any) {
      showToast(e.message || 'Erro ao sair do clã.');
    }
  };"""
content = content.replace(old_leave, new_leave)

with open('src/App.tsx', 'w') as f:
    f.write(content)
