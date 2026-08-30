import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

simulate_capture_replacement = """      };

      const operationId = 'op_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      const conquestHistoryEntryWithOp = { ...conquestHistoryEntry, operationId };
                        
      const controllerData = {
        id: currentUserProfile.id || 'usr_me',
        name: currentUserProfile.name,
        nickname: currentUserProfile.nickname,
        avatar: currentUserProfile.avatar,
        level: currentUserProfile.level,
        clan: currentUserProfile.crew || 'Sem Clã',
        crew: currentUserProfile.crew || 'Sem Clã',
      };

      const zoneOperation = {
        operationId,
        zoneId: z.id,
        type: 'CONQUEST' as const,
        playerId: currentUserProfile.id || 'usr_me',
        payload: {
          controller: controllerData,
          conquestHistoryEntry: conquestHistoryEntryWithOp
        },
        createdAt: Date.now(),
        syncStatus: 'pending' as const,
        retryCount: 0
      };

      const conqueredZone: Zone = {
        ...z,
        status: 'controlled',
        activeDispute: null,
        conquestHistory: [conquestHistoryEntryWithOp, ...pastHistory],
        controller: controllerData,
        dominance: 100,
        dominancePercent: 100,
        controllerName: controllerData.name,
        controllerNickname: controllerData.nickname,
        controllerAvatar: controllerData.avatar,
        controllerLevel: controllerData.level,
        controllerCrew: controllerData.crew,
        lastConquered: new Date().toISOString(),
      };

      z.status = 'controlled';
      z.activeDispute = null;
      z.dominance = 100;

      setZones((prev) => prev.map((item) => (item.id === z.id ? conqueredZone : item)));
      setSelectedZone((prev) => (prev?.id === z.id ? conqueredZone : prev));

      DatabaseService.queueZoneOperation(zoneOperation).catch(e => {
        console.error("Falha ao salvar conquista simulada na Outbox:", e);
      });"""

content = re.sub(r'      \};\n\n      const conqueredZone: Zone = \{.*?                        \}\)\.catch\(e => \{\n                          console\.error\("Falha ao salvar conquista no Firestore:", e\);\n                          // Atualização otimista fallback\n                          setZones\(\(prev\) => prev\.map\(\(item\) => \(item\.id === z\.id \? conqueredZone : item\)\)\);\n                          setSelectedZone\(\(prev\) => \(prev\?\.id === z\.id \? conqueredZone : prev\)\);\n                        \}\);', simulate_capture_replacement, content, flags=re.DOTALL)

with open('src/App.tsx', 'w') as f:
    f.write(content)
