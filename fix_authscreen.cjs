const fs = require('fs');
let authScreen = fs.readFileSync('src/components/AuthScreen.tsx', 'utf8');

if (!authScreen.includes('useEffect(')) {
  authScreen = authScreen.replace(
    'import React, { useState } from \'react\';',
    'import React, { useState, useEffect } from \'react\';'
  );
}

const useEffectHook = `
  useEffect(() => {
    const checkRedirect = async () => {
      try {
        setIsLoading(true);
        const user = await AuthService.handleRedirectResult();
        if (user) {
          onLoginSuccess();
        }
      } catch (err: any) {
        setError(err.message || 'Falha na autenticação Google.');
      } finally {
        setIsLoading(false);
      }
    };
    checkRedirect();
  }, [onLoginSuccess]);
`;

if (!authScreen.includes('checkRedirect')) {
  authScreen = authScreen.replace(
    'const [error, setError] = useState(\'\');',
    'const [error, setError] = useState(\'\');\n' + useEffectHook
  );
}

// Ensure loginWithGoogle return value is handled correctly
// It returns void on Native, so it shouldn't trigger onLoginSuccess immediately if it returns void.
// Wait, if loginWithGoogle returns void, it's redirecting, so the app will close/redirect. But if it returns the session, it should call onLoginSuccess.
authScreen = authScreen.replace(
  /await AuthService\.loginWithGoogle\(\);\s*onLoginSuccess\(\);/m,
  `const user = await AuthService.loginWithGoogle();
      if (user) {
        onLoginSuccess();
      }`
);

fs.writeFileSync('src/components/AuthScreen.tsx', authScreen, 'utf8');
console.log('AuthScreen.tsx updated');
