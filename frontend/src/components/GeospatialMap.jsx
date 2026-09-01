import React, { useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Dictionary of known geo-coordinates for hardcoded locations (fallback)
const GEO_DICT = {
  "mumbai": [19.0760, 72.8777],
  "delhi": [28.7041, 77.1025],
  "dubai": [25.2048, 55.2708],
  "karachi": [24.8607, 67.0011],
  "bengaluru": [12.9716, 77.5946],
  "kolkata": [22.5726, 88.3639],
};

const ICONS = {
  PERSON: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
  PHONE: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#4ecdc4" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>`,
  LOCATION: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
  VEHICLE: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#f9ca24" stroke-width="2"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a2 2 0 0 0-1.6-.8H9.3a2 2 0 0 0-1.6.8L5 11l-5.16.86a1 1 0 0 0-.84.99V16h3m10 0a2 2 0 1 1-4 0m4 0a2 2 0 1 0-4 0m-10 0a2 2 0 1 1-4 0m4 0a2 2 0 1 0-4 0"></path></svg>`,
  BANK_ACCOUNT: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#2ed573" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
  ORGANIZATION: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#a29bfe" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>`
};

const createDivIcon = (type, highlight, inFence = true) => {
  const svg = ICONS[type] || ICONS.PERSON;
  const glow = highlight ? 'drop-shadow(0 0 8px rgba(100,255,218,0.8))' : 'drop-shadow(0 0 4px rgba(0,0,0,0.8))';
  const opacity = inFence ? 1 : 0.2;
  const border = inFence ? '1px solid #333' : '1px solid #111';
  const html = `<div style="opacity: ${opacity}; width: 32px; height: 32px; filter: ${glow}; background: rgba(0,0,0,0.7); border: ${border}; border-radius: 50%; padding: 4px; display: flex; align-items: center; justify-content: center;">${svg}</div>`;
  
  return L.divIcon({
    html,
    className: 'custom-leaflet-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

export default function GeospatialMap({ elements, onNodeSelect, selectedEntity }) {
  const { nodes, edges } = elements;
  const [geofenceCenter, setGeofenceCenter] = useState(null);
  const [geofenceRadius, setGeofenceRadius] = useState(5000);

  function GeofenceClickCapture() {
    useMapEvents({
      click(e) {
        setGeofenceCenter([e.latlng.lat, e.latlng.lng]);
      }
    });
    return null;
  }

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

  // Calculate how many nodes are in fence
  const nodesInFence = mapData.geoNodes.filter(n => {
    if (!geofenceCenter) return true;
    return L.latLng(geofenceCenter).distanceTo(L.latLng(n.coords)) <= geofenceRadius;
  });

  return (
    <div className="w-full h-full relative z-0">
      {/* Geofence UI Panel */}
      <div className="absolute top-4 right-4 z-[400] bg-[var(--bg-primary)] p-4 rounded-xl border border-[var(--border)] shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-md bg-opacity-95 min-w-[250px]">
        <h3 className="text-sm font-bold text-[var(--neon-gold)] mb-2 flex justify-between items-center">
          <span>Target Geofence</span>
          {geofenceCenter && (
            <button onClick={() => setGeofenceCenter(null)} className="text-xs text-[var(--text-accent)] hover:text-white bg-[#1e3a5f] px-2 py-0.5 rounded">Clear</button>
          )}
        </h3>
        
        {!geofenceCenter ? (
          <p className="text-xs text-[var(--text-secondary)] opacity-70">Click anywhere on the map to establish a geofence perimeter.</p>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex justify-between text-xs text-[var(--text-secondary)]">
              <span>Radius: {(geofenceRadius / 1000).toFixed(1)} km</span>
            </div>
            <input 
              type="range" 
              min="1000" 
              max="50000" 
              step="1000"
              value={geofenceRadius} 
              onChange={(e) => setGeofenceRadius(Number(e.target.value))}
              className="w-full h-1 bg-[var(--bg-highlight)] rounded-lg appearance-none cursor-pointer"
              style={{ accentColor: 'var(--neon-gold)' }}
            />
            <div className="mt-2 pt-2 border-t border-[var(--border)] flex justify-between items-center">
               <div className="text-xs text-[var(--text-secondary)]">Entities inside perimeter: <strong className="text-white ml-1 text-sm">{nodesInFence.length}</strong></div>
            </div>
          </div>
        )}
      </div>

      <MapContainer 
        center={center} 
        zoom={5} 
        style={{ width: '100%', height: '100%', background: '#0a0a1a' }}
        zoomControl={false}
      >
        <GeofenceClickCapture />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          className="map-tiles"
        />

        {geofenceCenter && (
          <Circle 
            center={geofenceCenter} 
            radius={geofenceRadius} 
            pathOptions={{ color: '#f9ca24', fillColor: '#f9ca24', fillOpacity: 0.1, weight: 1, dashArray: '4 4' }} 
          />
        )}

        {mapData.geoEdges.map(edge => {
          const inFence1 = !geofenceCenter || L.latLng(geofenceCenter).distanceTo(L.latLng(edge.sourceCoords)) <= geofenceRadius;
          const inFence2 = !geofenceCenter || L.latLng(geofenceCenter).distanceTo(L.latLng(edge.targetCoords)) <= geofenceRadius;
          const inFence = inFence1 && inFence2;
          return (
            <Polyline 
              key={edge.id}
              positions={[edge.sourceCoords, edge.targetCoords]}
              pathOptions={{ color: '#4ecdc4', weight: 2, dashArray: '4 4', opacity: inFence ? 0.6 : 0.05 }}
            />
          );
        })}

        {mapData.geoNodes.map(node => {
          const isSelected = selectedEntity && (selectedEntity.id === node.id || selectedEntity.data?.id === node.id);
          const inFence = !geofenceCenter || L.latLng(geofenceCenter).distanceTo(L.latLng(node.coords)) <= geofenceRadius;
          return (
            <Marker 
              key={node.id} 
              position={node.coords}
              icon={createDivIcon(node.type, isSelected, inFence)}
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
