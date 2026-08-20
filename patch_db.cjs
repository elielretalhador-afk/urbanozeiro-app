const fs = require('fs');
let content = fs.readFileSync('src/services/db.ts', 'utf8');

// Replace synchronous generic functions with async for IDB, sync for LocalStorage
// Add idb-keyval import
content = content.replace(
  /import \{ CacheManager \}/,
  `import { get as idbGet, set as idbSet } from 'idb-keyval';\nimport { CacheManager }`
);

// We will replace loadData and saveData.
const asyncHelpers = `
const loadLocal = <T>(key: string, mockFallback: T): T => {
  try {
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error(e);
  }
  return mockFallback;
};

const saveLocal = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(e);
  }
};

const loadIdb = async <T>(key: string, mockFallback: T): Promise<T> => {
  try {
    const data = await idbGet<T>(key);
    if (data) return data;
  } catch (e) {
    console.error(e);
  }
  return mockFallback;
};

const saveIdb = async <T>(key: string, data: T): Promise<void> => {
  try {
    await idbSet(key, data);
  } catch (e) {
    console.error(e);
  }
};
`;

content = content.replace(
  /\/\/ Função genérica de leitura[\s\S]*?console\.error\(\`Erro ao salvar \$\{key\} no banco local:\`, e\);\n  \}\n\};/m,
  asyncHelpers
);

// Now update all occurrences of loadData/saveData
content = content.replace(/loadData<UserProfile>\(KEYS\.USER, /g, 'loadLocal<UserProfile>(KEYS.USER, ');
content = content.replace(/loadData<PlayerSettings>\(KEYS\.SETTINGS, /g, 'loadLocal<PlayerSettings>(KEYS.SETTINGS, ');
content = content.replace(/loadData<TutorialState>\(KEYS\.TUTORIAL, /g, 'loadLocal<TutorialState>(KEYS.TUTORIAL, ');
content = content.replace(/loadData<AppNotification\[\]>\(KEYS\.NOTIFICATIONS, /g, 'loadLocal<AppNotification[]>(KEYS.NOTIFICATIONS, ');
content = content.replace(/loadData<Achievement\[\]>\(KEYS\.ACHIEVEMENTS, /g, 'loadLocal<Achievement[]>(KEYS.ACHIEVEMENTS, ');

content = content.replace(/loadData<Zone\[\]>\(KEYS\.ZONES, /g, 'await loadIdb<Zone[]>(KEYS.ZONES, ');
content = content.replace(/loadData<ActivitySession\[\]>\(KEYS\.SESSIONS, /g, 'await loadIdb<ActivitySession[]>(KEYS.SESSIONS, ');
content = content.replace(/loadData<PlayerPublicActivity\[\]>\(KEYS\.ACTIVITIES, /g, 'await loadIdb<PlayerPublicActivity[]>(KEYS.ACTIVITIES, ');

content = content.replace(/saveData\(KEYS\.USER, /g, 'saveLocal(KEYS.USER, ');
content = content.replace(/saveData\(KEYS\.SETTINGS, /g, 'saveLocal(KEYS.SETTINGS, ');
content = content.replace(/saveData\(KEYS\.NOTIFICATIONS, /g, 'saveLocal(KEYS.NOTIFICATIONS, ');
content = content.replace(/saveData\(KEYS\.ACHIEVEMENTS, /g, 'saveLocal(KEYS.ACHIEVEMENTS, ');

content = content.replace(/saveData\(KEYS\.ZONES, /g, 'await saveIdb(KEYS.ZONES, ');
content = content.replace(/saveData\(KEYS\.SESSIONS, /g, 'await saveIdb(KEYS.SESSIONS, ');
content = content.replace(/saveData\(KEYS\.ACTIVITIES, /g, 'await saveIdb(KEYS.ACTIVITIES, ');

// We also need to fix updateZone, saveSession, saveActivity as they might have become async or already are.
// They are already async!
// But wait, updateZone has:
// const zones = loadData<Zone[]>(KEYS.ZONES, INITIAL_ZONES);
// It will now be:
// const zones = await loadIdb<Zone[]>(KEYS.ZONES, INITIAL_ZONES);

fs.writeFileSync('src/services/db.ts', content);
