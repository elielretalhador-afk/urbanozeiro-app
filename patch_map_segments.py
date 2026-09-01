import re

with open("src/components/MapView.tsx", "r") as f:
    content = f.read()

# Fix zone marker for segments
old_zone_icon_block = """      const zoneIcon = L.divIcon({
        className: 'custom-zone-marker',
        html: `
          <div class="group relative flex flex-col items-center cursor-pointer transform transition-transform hover:scale-110 select-none">
            <!-- Zone Name & Status Tag Pill -->
            <div class="px-2 py-0.5 mb-1 rounded-md bg-[#090d14]/95 border shadow-lg flex items-center gap-1.5"
                 style="border-color: ${effectiveBorderColor}90;">"""

new_zone_icon_block = """      const isSegment = zone.shape === 'segment';
      const isActiveSegment = isSegment && activeSegmentAttempt?.segmentId === zone.id;
      
      const zoneIcon = L.divIcon({
        className: 'custom-zone-marker',
        html: isSegment ? `
          <div class="group relative flex flex-col items-center cursor-pointer transform transition-transform hover:scale-110 select-none ${isActiveSegment ? 'animate-pulse' : 'opacity-80 hover:opacity-100'}">
             <div class="px-2 py-0.5 mb-1 rounded-md bg-[#090d14]/95 border shadow-lg flex items-center gap-1.5"
                 style="border-color: ${effectiveBorderColor}90;">
                 <span class="text-[9px] font-black text-white whitespace-nowrap font-display uppercase tracking-widest">⚡ SPRINT</span>
             </div>
             <div class="w-1.5 h-1.5 rounded-full" style="background-color: ${effectiveBorderColor};"></div>
          </div>
        ` : `
          <div class="group relative flex flex-col items-center cursor-pointer transform transition-transform hover:scale-110 select-none">
            <!-- Zone Name & Status Tag Pill -->
            <div class="px-2 py-0.5 mb-1 rounded-md bg-[#090d14]/95 border shadow-lg flex items-center gap-1.5"
                 style="border-color: ${effectiveBorderColor}90;">"""

content = content.replace(old_zone_icon_block, new_zone_icon_block)

# Polyline drawing for Segment
old_polyline_segment = """          if (zone.shape === 'segment' && zone.path && zone.path.length > 1) {
            const isActiveSegment = activeSegmentAttempt?.segmentId === zone.id;
            const segmentColor = isActiveSegment ? (activeSegmentAttempt.status === 'approaching' ? '#f59e0b' : '#f43f5e') : effectiveBorderColor;
            
            layer = L.polyline(zone.path as L.LatLngExpression[], {
              color: segmentColor,
              weight: isActiveSegment ? 6 : (isSelected ? 4 : 3),
              opacity: isActiveSegment ? 1 : 0.9,
              dashArray: isActiveSegment ? undefined : (isContested ? '8, 8' : isFree ? '6, 6' : undefined),
              className: 'transition-all duration-300',
            }).addTo(map);"""

new_polyline_segment = """          if (zone.shape === 'segment' && zone.path && zone.path.length > 1) {
            const isActiveSegment = activeSegmentAttempt?.segmentId === zone.id;
            const segmentColor = isActiveSegment ? (activeSegmentAttempt.status === 'approaching' ? '#f59e0b' : '#f43f5e') : effectiveBorderColor;
            
            // Add subtle glow layer if active or selected
            if (isActiveSegment || isSelected) {
               L.polyline(zone.path as L.LatLngExpression[], {
                 color: segmentColor,
                 weight: isActiveSegment ? 12 : 8,
                 opacity: isActiveSegment ? 0.3 : 0.15,
                 className: 'transition-all duration-300',
               }).addTo(map);
            }

            layer = L.polyline(zone.path as L.LatLngExpression[], {
              color: segmentColor,
              weight: isActiveSegment ? 5 : (isSelected ? 3.5 : 2.5),
              opacity: isActiveSegment ? 1 : (isSelected ? 0.9 : 0.6),
              dashArray: isActiveSegment ? undefined : '5, 5',
              className: 'transition-all duration-300',
            }).addTo(map);"""

content = content.replace(old_polyline_segment, new_polyline_segment)

with open("src/components/MapView.tsx", "w") as f:
    f.write(content)
