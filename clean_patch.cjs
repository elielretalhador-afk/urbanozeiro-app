const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('import { Geolocation }')) {
  content = content.replace(
    "import React, { useState, useEffect, useRef } from 'react';",
    "import React, { useState, useEffect, useRef } from 'react';\nimport { Geolocation } from '@capacitor/geolocation';"
  );
}

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
    const watchId = navigator.geolocation.watchPosition(`;

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
            const posToUse = pos as any;
            if (!posToUse.coords) return;
            // Map Capacitor pos to the expected shape (it is basically the same, just keeping the same variable name)
            const speed = posToUse.coords.speed;
            
            // To simulate the original function signature call:
            ((pos) => {`;

const targetBlockEnd = `
      },
      (err) => {
        console.info('GPS watch fallback:', err.message);
        setIsGpsActive(false);
      },
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

const replacementEnd = `
      })(posToUse); // IIFE to encapsulate original logic
          }
        );
      } catch (e: any) {
        console.warn('Geolocation watch error', e);
      }
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
console.log('Clean patch done');
