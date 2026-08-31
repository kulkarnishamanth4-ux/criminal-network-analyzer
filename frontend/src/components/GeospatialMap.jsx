import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Coordinates dictionary for Demo
const GEO_DICT = {
  "mumbai": [18.9217, 72.8332],
  "delhi": [28.6304, 77.2177],
  "dubai": [25.2694, 55.2972],
  "bandra": [19.0440, 72.8205],
  "dongri": [18.9602, 72.8364],
  "karachi": [24.8607, 67.0011]
};

const ICONS = {
  PERSON: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
  PHONE: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#4ecdc4" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>`,
  LOCATION: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#45b7d1" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
  VEHICLE: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#96c93d" stroke-width="2"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a2 2 0 0 0-1.6-.8H8.3a2 2 0 0 0-1.6.8L4 11l-5.16.86a1 1 0 0 0-.84.99V16h3m10 0a2 2 0 1 0-4 0 2 2 0 0 0 4 0zm-10 0a2 2 0 1 0-4 0 2 2 0 0 0 4 0z"></path></svg>`,
  BANK_ACCOUNT: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#f9ca24" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>`,
  ORGANIZATION: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#a29bfe" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>`
};

const createDivIcon = (type, highlight) => {
  const svg = ICONS[type] || ICONS.PERSON;
  const glow = highlight ? 'drop-shadow(0 0 8px rgba(100,255,218,0.8))' : 'drop-shadow(0 0 4px rgba(0,0,0,0.8))';
  const html = `<div style="width: 32px; height: 32px; filter: ${glow}; background: rgba(0,0,0,0.7); border: 1px solid #333; border-radius: 50%; padding: 4px; display: flex; align-items: center; justify-content: center;">${svg}</div>`;
  
  return L.divIcon({
    html,
    className: 'custom-leaflet-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

export default function GeospatialMap({ elements, onNodeSelect, selectedEntity }) {
  const { nodes, edges } = elements;

  const mapData = useMemo(() => {
    const geoNodes = [];
    const geoEdges = [];
    
    // 1. First find all actual locations and assign them coords
    const locations = {};
    nodes.forEach(n => {
      const data = n.data || n;
      if (data.type === 'LOCATION') {
        const name = (data.label || "").toLowerCase();
        let coords = null;
        
        if (data.properties && data.properties.latitude !== undefined && data.properties.longitude !== undefined) {
          coords = [parseFloat(data.properties.latitude), parseFloat(data.properties.longitude)];
        } else {
          for (const [key, val] of Object.entries(GEO_DICT)) {
            if (name.includes(key)) coords = val;
          }
        }
        
        if (coords) {
          locations[data.id] = { ...data, coords };
          geoNodes.push({ ...data, coords });
        }
      }
    });

    // 2. Attach entities directly connected to locations
    const nodeCoords = { ...locations };
    
    // Pass 1: Direct location links (SPOTTED_AT)
    edges.forEach(e => {
      const data = e.data || e;
      const source = nodes.find(n => (n.data?.id || n.id) === data.source);
      const target = nodes.find(n => (n.data?.id || n.id) === data.target);
      if (source && target) {
        let sData = source.data || source;
        let tData = target.data || target;
        
        // If target is a location and source is not yet placed
        if (locations[tData.id] && !nodeCoords[sData.id]) {
          const jx = (Math.random() - 0.5) * 0.05; // Slightly larger jitter
          const jy = (Math.random() - 0.5) * 0.05;
          const c = locations[tData.id].coords;
          const newCoords = [c[0] + jx, c[1] + jy];
          nodeCoords[sData.id] = { ...sData, coords: newCoords };
          geoNodes.push({ ...sData, coords: newCoords });
        }
        // If source is a location and target is not yet placed
        if (locations[sData.id] && !nodeCoords[tData.id]) {
          const jx = (Math.random() - 0.5) * 0.05;
          const jy = (Math.random() - 0.5) * 0.05;
          const c = locations[sData.id].coords;
          const newCoords = [c[0] + jx, c[1] + jy];
          nodeCoords[tData.id] = { ...tData, coords: newCoords };
          geoNodes.push({ ...tData, coords: newCoords });
        }
      }
    });

    // Pass 2: Inherited locations (e.g. Phone owned by Person at Location)
    edges.forEach(e => {
      const data = e.data || e;
      const source = nodes.find(n => (n.data?.id || n.id) === data.source);
      const target = nodes.find(n => (n.data?.id || n.id) === data.target);
      if (source && target) {
        let sData = source.data || source;
        let tData = target.data || target;
        
        if (nodeCoords[tData.id] && !nodeCoords[sData.id]) {
          const jx = (Math.random() - 0.5) * 0.03;
          const jy = (Math.random() - 0.5) * 0.03;
          const c = nodeCoords[tData.id].coords;
          const newCoords = [c[0] + jx, c[1] + jy];
          nodeCoords[sData.id] = { ...sData, coords: newCoords };
          geoNodes.push({ ...sData, coords: newCoords });
        }
        if (nodeCoords[sData.id] && !nodeCoords[tData.id]) {
          const jx = (Math.random() - 0.5) * 0.03;
          const jy = (Math.random() - 0.5) * 0.03;
          const c = nodeCoords[sData.id].coords;
          const newCoords = [c[0] + jx, c[1] + jy];
          nodeCoords[tData.id] = { ...tData, coords: newCoords };
          geoNodes.push({ ...tData, coords: newCoords });
        }
      }
    });
    
    // 3. For any edges between geolocated nodes, add a polyline
    edges.forEach(e => {
      const data = e.data || e;
      if (nodeCoords[data.source] && nodeCoords[data.target]) {
        geoEdges.push({
          id: data.id,
          sourceCoords: nodeCoords[data.source].coords,
          targetCoords: nodeCoords[data.target].coords,
          type: data.type
        });
      }
    });

    return { geoNodes, geoEdges };
  }, [nodes, edges]);

  if (mapData.geoNodes.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0a0a0a] text-gray-400">
        <div 
          className="w-16 h-16 opacity-50" 
          dangerouslySetInnerHTML={{ __html: ICONS.LOCATION }} 
        />
        <p className="mt-4 text-sm font-medium">No geospatial data available for Map View.</p>
        <p className="text-xs mt-2 text-gray-500">Entities must have LOCATION or SPOTTED_AT links.</p>
      </div>
    );
  }

  // Calculate center based on first location, or default to India
  const center = mapData.geoNodes.length > 0 ? mapData.geoNodes[0].coords : [20.5937, 78.9629];

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={center} 
        zoom={5} 
        style={{ width: '100%', height: '100%', background: '#0a0a1a' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          className="map-tiles"
        />

        {mapData.geoEdges.map(edge => (
          <Polyline 
            key={edge.id}
            positions={[edge.sourceCoords, edge.targetCoords]}
            pathOptions={{ color: '#45b7d1', weight: 2, dashArray: '4 4', opacity: 0.5 }}
          />
        ))}

        {mapData.geoNodes.map(node => {
          const isSelected = selectedEntity && (selectedEntity.id === node.id || selectedEntity.data?.id === node.id);
          return (
            <Marker 
              key={node.id} 
              position={node.coords}
              icon={createDivIcon(node.type, isSelected)}
              eventHandlers={{
                click: () => onNodeSelect && onNodeSelect(node)
              }}
            >
              <Popup className="custom-leaflet-popup">
                <div className="bg-[#111] text-white p-2 rounded border border-[#333]">
                  <strong className="text-[var(--text-accent)] block mb-1">{node.label || node.id}</strong>
                  <span className="text-xs text-gray-400">{node.type}</span>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      {/* Global styles for custom Leaflet overrides to fit dark theme */}
      <style>{`
        .leaflet-container { font-family: inherit; }
        .leaflet-popup-content-wrapper, .leaflet-popup-tip { background: #111; color: white; border: 1px solid #333; }
        .leaflet-popup-content { margin: 0; }
        .leaflet-popup-close-button { display: none; }
        .map-tiles { filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%); }
      `}</style>
    </div>
  );
}
