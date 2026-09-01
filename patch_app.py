with open('src/App.tsx', 'r') as f:
    c = f.read()

filter_watch = """                ) {
                  return;
                }

                // Filtro Espacial Otimizado (Bounding Box de ~2.2km) para evitar Haversine desnecessário
                if (
                  Math.abs(latitude - z.center[0]) > 0.02 ||
                  Math.abs(longitude - z.center[1]) > 0.02
                ) {
                  return;
                }

                const distMeters = calculateDistanceKm(latitude, longitude, z.center[0], z.center[1]) * 1000;"""

c = c.replace(
"""                ) {
                  return;
                }
                const distMeters = calculateDistanceKm(latitude, longitude, z.center[0], z.center[1]) * 1000;""", filter_watch)

filter_start = """        ) {
          return;
        }

        // Filtro Espacial Otimizado (Bounding Box de ~2.2km) para evitar Haversine desnecessário
        if (
          Math.abs(initialCoords.latitude - z.center[0]) > 0.02 ||
          Math.abs(initialCoords.longitude - z.center[1]) > 0.02
        ) {
          return;
        }

        const distMeters = calculateDistanceKm(initialCoords.latitude, initialCoords.longitude, z.center[0], z.center[1]) * 1000;"""

c = c.replace(
"""        ) {
          return;
        }
        const distMeters = calculateDistanceKm(initialCoords.latitude, initialCoords.longitude, z.center[0], z.center[1]) * 1000;""", filter_start)


with open('src/App.tsx', 'w') as f:
    f.write(c)
