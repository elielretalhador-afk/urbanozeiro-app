import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

if 'import { Geolocation }' not in content:
    content = content.replace("import React, { useState, useEffect, useRef } from 'react';", "import React, { useState, useEffect, useRef } from 'react';\nimport { Geolocation } from '@capacitor/geolocation';")

# Find the block
start_str = "    if (!('geolocation' in navigator)) {"
end_str = "      navigator.geolocation.clearWatch(watchId);\n    };\n  }, []);"

# We just want to find everything between '  // Real Geolocation API tracking\n  useEffect(() => {' and '  }, []);'
pattern = re.compile(r"  // Real Geolocation API tracking\n  useEffect\(\(\) => \{.*?\n  \}, \[\]\);", re.DOTALL)
match = pattern.search(content)
if not match:
    print("Not found")
    exit(1)

old_block = match.group(0)

# We want to extract the inner body of the watchPosition callback.
# The callback starts after '    const watchId = navigator.geolocation.watchPosition(\n      (pos) => {'
# And ends before '      },\n      (err) => {'

inner_match = re.search(r"    const watchId = navigator\.geolocation\.watchPosition\(\n      \(\w+\) => \{\n(.*?)      \},\n      \(err\) => \{", old_block, re.DOTALL)
if not inner_match:
    print("Inner not found")
    exit(1)

inner_logic = inner_match.group(1)

new_block = f"""  // Real Geolocation API tracking
  useEffect(() => {{
    let watchIdStr: string | null = null;
    
    const initGPS = async () => {{
      try {{
        const permStatus = await Geolocation.checkPermissions();
        if (permStatus.location !== 'granted') {{
          const reqStatus = await Geolocation.requestPermissions();
          if (reqStatus.location !== 'granted') {{
            setIsGpsActive(false);
            console.info('Permissão de GPS negada.');
            return;
          }}
        }}

        const initPos = await Geolocation.getCurrentPosition({{ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }});
        if (initPos && initPos.coords) {{
          const {{ latitude, longitude }} = initPos.coords;
          if (typeof latitude === 'number' && !isNaN(latitude) && typeof longitude === 'number' && !isNaN(longitude)) {{
            const newCoords: [number, number] = [latitude, longitude];
            setPlayerLocation({{ latitude, longitude }});
            setUserCoords(newCoords);
            setIsGpsActive(true);
            prevCoordsRef.current = newCoords;
          }}
        }}
      }} catch (err: any) {{
        setIsGpsActive(false);
      }}

      try {{
        watchIdStr = await Geolocation.watchPosition(
          {{ enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }},
          (pos, err) => {{
            if (err) {{
              setIsGpsActive(false);
              return;
            }}
            if (!pos || !pos.coords) return;
{inner_logic}
          }}
        );
      }} catch (e: any) {{
        console.warn('Geolocation watch error', e);
      }}
    }};
    initGPS();

    return () => {{
      if (watchIdStr) Geolocation.clearWatch({{ id: watchIdStr }}).catch(()=>{{}});
    }};
  }}, []);"""

content = content.replace(old_block, new_block)

# Add auth init
content = content.replace("  const [authState, setAuthState] = useState<any>({ isAuthenticated: true, user: CURRENT_USER });", 
"""  const [authState, setAuthState] = useState<any>('LOADING');
  useEffect(() => {
    AuthService.getCurrentUser().then(session => {
      setAuthState(session ? 'AUTHENTICATED' : 'UNAUTHENTICATED');
    }).catch(() => setAuthState('UNAUTHENTICATED'));
  }, []);""")

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Patch applied")
