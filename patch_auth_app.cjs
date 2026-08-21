const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add imports
if (!content.includes('import { auth } from')) {
    content = content.replace(
        "import React, { useState, useEffect, useRef, useMemo } from 'react';",
        "import React, { useState, useEffect, useRef, useMemo } from 'react';\nimport { auth } from './lib/firebase';\nimport { onAuthStateChanged } from 'firebase/auth';"
    );
}

// Add useEffect to handle auth change
const authEffect = `
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(prev => {
          if (prev.authId === firebaseUser.uid) return prev;
          const updated = { ...prev, authId: firebaseUser.uid };
          localStorage.setItem('urbanozeiro_user', JSON.stringify(updated));
          return updated;
        });
      }
    });
    return () => unsubscribe();
  }, []);
`;

content = content.replace('  const userRef = useRef(user);\n', '  const userRef = useRef(user);\n' + authEffect);

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('App.tsx patched for auth');
