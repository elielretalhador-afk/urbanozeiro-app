const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add import if missing
if (!content.includes('import { Geolocation }')) {
  content = content.replace(
    "import React, { useState, useEffect, useRef } from 'react';",
    "import React, { useState, useEffect, useRef } from 'react';\nimport { Geolocation } from '@capacitor/geolocation';"
  );
}

// Replace navigator.geolocation block safely
// We'll isolate the exact block:
const targetBlockStart = `// Real Geolocation API tracking
  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setIsGpsActive(false);
      return;
    }

    // Request initial position
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (
          pos &&
          pos.coords &&
          typeof pos.coords.latitude === 'number' &&
          !isNaN(pos.coords.latitude) &&
          isFinite(pos.coords.latitude) &&
          typeof pos.coords.longitude === 'number' &&
          !isNaN(pos.coords.longitude) &&
          isFinite(pos.coords.longitude)
        ) {
          const newCoords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setPlayerLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
          setUserCoords(newCoords);
          setIsGpsActive(true);
          prevCoordsRef.current = newCoords;
        }
      },
      (err) => {
        console.info('GPS initial position fallback:', err.message);
        setIsGpsActive(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    // Watch position continuously
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {`;

const targetBlockEnd = `
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 15000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);`;

if (content.includes(targetBlockStart)) {
  console.log('Found start block');
  
  const replacementStart = `// Real Geolocation API tracking
  useEffect(() => {
    let watchIdStr: string | null = null;
    
    const initGPS = async () => {
      try {
        const permStatus = await Geolocation.checkPermissions();
        if (permStatus.location !== 'granted') {
          const reqStatus = await Geolocation.requestPermissions();
          if (reqStatus.location !== 'granted') {
            setIsGpsActive(false);
            console.info('Permissão de GPS negada.');
            return;
          }
        }

        // Request initial position
        const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
        if (pos && pos.coords) {
          const { latitude, longitude } = pos.coords;
          if (typeof latitude === 'number' && !isNaN(latitude) && typeof longitude === 'number' && !isNaN(longitude)) {
            const newCoords: [number, number] = [latitude, longitude];
            setPlayerLocation({ latitude, longitude });
            setUserCoords(newCoords);
            setIsGpsActive(true);
            prevCoordsRef.current = newCoords;
          }
        }
      } catch (err: any) {
        console.info('GPS initial position fallback:', err.message);
        setIsGpsActive(false);
      }

      try {
        watchIdStr = await Geolocation.watchPosition(
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 },
          (pos, err) => {
            if (err) {
              console.info('GPS watch fallback:', err.message);
              setIsGpsActive(false);
              return;
            }
            if (!pos) return;
            const posToUse = pos as any; // fallback cast to avoid tight coupling
            if (!posToUse.coords) return;
            if (
                typeof posToUse.coords.latitude === 'number' &&
                !isNaN(posToUse.coords.latitude) &&
                isFinite(posToUse.coords.latitude) &&
                typeof posToUse.coords.longitude === 'number' &&
                !isNaN(posToUse.coords.longitude) &&
                isFinite(posToUse.coords.longitude)
            ) {
              // we inject the rest of the existing code exactly here.
              const pos = posToUse;
`;

  const replacementEnd = `
    };
    initGPS();

    return () => {
      if (watchIdStr) {
        Geolocation.clearWatch({ id: watchIdStr }).catch(()=>console.warn('Failed to clear watch'));
      }
    };
  }, []);`;

  content = content.replace(targetBlockStart, replacementStart);
  content = content.replace(targetBlockEnd, replacementEnd);
  
  fs.writeFileSync('src/App.tsx', content, 'utf8');
  console.log('Patched App.tsx GPS successfully');
} else {
  console.log('Target block not found, check regex or file content.');
}
