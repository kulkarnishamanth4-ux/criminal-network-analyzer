import React, { useMemo, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Comprehensive dictionary of known geo-coordinates
const GEO_DICT = {
  // Mumbai local landmarks
  "taj lands end": [19.0434, 72.8194],
  "taj": [19.0434, 72.8194],
  "bandra": [19.0596, 72.8295],
  "dongri": [18.9587, 72.8373],
  "safehouse": [18.9587, 72.8373],
  "mumbai": [19.0760, 72.8777],
  "bombay": [19.0760, 72.8777],
  "mum": [19.0760, 72.8777],
  
  // International Hubs
  "dubai": [25.2048, 55.2708],
  "dxb": [25.2048, 55.2708],
  "enbd": [25.2048, 55.2708],
  "karachi": [24.8607, 67.0011],
  "clifton": [24.8258, 67.0322],
  "pakistan": [24.8607, 67.0011],
  
  // National Case Hubs
  "bengaluru": [12.9716, 77.5946],
  "bangalore": [12.9716, 77.5946],
  "whitefield": [12.9698, 77.7500],
  "amritsar": [31.6340, 74.8723],
  "punjab": [31.6340, 74.8723],
  "asr": [31.6340, 74.8723],
  "guwahati": [26.1445, 91.7362],
  "assam": [26.1445, 91.7362],
  "ghy": [26.1445, 91.7362],
  "surat": [21.1702, 72.8311],
  "gujarat": [21.1702, 72.8311],
  "bastar": [19.0740, 82.0298],
  "chhattisgarh": [19.0740, 82.0298],
  "wayanad": [11.6854, 76.1320],
  "kerala": [11.6854, 76.1320],
  "gorakhpur": [26.7606, 83.3732],
  "delhi": [28.7041, 77.1025],
  "kolkata": [22.5726, 88.3639],
};

const ICONS = {
  PERSON: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ff4757" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
  PHONE: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#00d2d3" stroke-width="2.5"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>`,
  LOCATION: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#54a0ff" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
  VEHICLE: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#1dd1a1" stroke-width="2.5"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a2 2 0 0 0-1.6-.8H9.3a2 2 0 0 0-1.6.8L5 11l-5.16.86a1 1 0 0 0-.84.99V16h3m10 0a2 2 0 1 1-4 0m4 0a2 2 0 1 0-4 0m-10 0a2 2 0 1 1-4 0m4 0a2 2 0 1 0-4 0"></path></svg>`,
  BANK_ACCOUNT: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#feca57" stroke-width="2.5"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
  ORGANIZATION: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#a29bfe" stroke-width="2.5"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>`,
  SOCIAL_HANDLE: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#fd79a8" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`
};

const createDivIcon = (type, highlight, inFence = true) => {
  const svg = ICONS[type] || ICONS.PERSON;
  const glow = highlight ? 'drop-shadow(0 0 10px rgba(100,255,218,1))' : 'drop-shadow(0 0 4px rgba(0,0,0,0.8))';
  const opacity = inFence ? 1 : 0.25;
  const border = highlight ? '2px solid #64ffda' : inFence ? '1.5px solid rgba(255,255,255,0.2)' : '1px solid #222';
  const bg = highlight ? 'rgba(10,30,30,0.95)' : 'rgba(10,10,26,0.9)';
  const html = `<div style="opacity: ${opacity}; width: 34px; height: 34px; filter: ${glow}; background: ${bg}; border: ${border}; border-radius: 50%; padding: 5px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;">${svg}</div>`;
  
  return L.divIcon({
    html,
    className: 'custom-leaflet-icon',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
};

// Component to dynamically fit the map to show all geo nodes
function MapBoundsFitter({ geoNodes }) {
  const map = useMap();

  useEffect(() => {
    if (!geoNodes || geoNodes.length === 0) return;
    
    if (geoNodes.length === 1) {
      map.setView(geoNodes[0].coords, 12, { animate: true });
      return;
    }

    const bounds = L.latLngBounds(geoNodes.map(n => n.coords));
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14, animate: true });
  }, [geoNodes, map]);

  return null;
}

export default function GeospatialMap({ elements, onNodeSelect, selectedEntity }) {
  const { nodes = [], edges = [] } = elements || {};
  const [geofenceCenter, setGeofenceCenter] = useState(null);
  const [geofenceRadius, setGeofenceRadius] = useState(15000);

  function GeofenceClickCapture() {
    useMapEvents({
      click(e) {
        setGeofenceCenter([e.latlng.lat, e.latlng.lng]);
      }
    });
    return null;
  }

  const mapData = useMemo(() => {
    const rawNodes = Array.isArray(nodes) ? nodes : [];
    const rawEdges = Array.isArray(edges) ? edges : [];
    
    const geoNodes = [];
    const geoEdges = [];
    const nodeCoords = {};

    // 1. Resolve direct location coordinates (from properties or dictionary matching)
    rawNodes.forEach(n => {
      const data = n.data || n;
      const id = String(data.id);
      const name = (data.label || data.name || "").toLowerCase();
      const type = data.type || data.entity_type || 'UNKNOWN';

      let coords = null;
      if (data.properties && data.properties.latitude !== undefined && data.properties.longitude !== undefined) {
        coords = [parseFloat(data.properties.latitude), parseFloat(data.properties.longitude)];
      } else {
        for (const [key, val] of Object.entries(GEO_DICT)) {
          if (name.includes(key)) {
            coords = val;
            break;
          }
        }
      }

      // Contextual fallbacks based on specific known entity names
      if (!coords) {
        if (name.includes('dawood') || name.includes('+92')) coords = GEO_DICT['karachi'];
        else if (name.includes('dubai') || name.includes('enbd') || name.includes('d-international') || name.includes('+971')) coords = GEO_DICT['dubai'];
        else if (name.includes('salem') || name.includes('shakeel') || name.includes('firoz') || name.includes('roshan') || name.includes('+91') || name.includes('mumbai') || name.includes('hdfc-mum') || name.includes('icici-mum') || name.includes('sbi-mum') || name.includes('mh-01') || name.includes('mh-02')) {
          coords = GEO_DICT['mumbai'];
        }
      }

      if (coords) {
        // Add tiny deterministic jitter so multiple nodes at Mumbai/Dubai don't overlap perfectly
        const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const jx = ((hash % 100) - 50) * 0.0008;
        const jy = (((hash * 13) % 100) - 50) * 0.0008;
        const adjustedCoords = [coords[0] + jx, coords[1] + jy];

        nodeCoords[id] = { ...data, id, coords: adjustedCoords };
        geoNodes.push({ ...data, id, coords: adjustedCoords });
      }
    });

    // 2. Multi-pass topological propagation: Propagate location along edges
    for (let pass = 0; pass < 2; pass++) {
      rawEdges.forEach(e => {
        const data = e.data || e;
        const sId = String(data.source);
        const tId = String(data.target);

        if (nodeCoords[tId] && !nodeCoords[sId]) {
          const sNode = rawNodes.find(n => String(n.data?.id ?? n.id) === sId);
          if (sNode) {
            const sData = sNode.data || sNode;
            const c = nodeCoords[tId].coords;
            const jx = (Math.random() - 0.5) * 0.015;
            const jy = (Math.random() - 0.5) * 0.015;
            const newCoords = [c[0] + jx, c[1] + jy];
            nodeCoords[sId] = { ...sData, id: sId, coords: newCoords };
            geoNodes.push({ ...sData, id: sId, coords: newCoords });
          }
        } else if (nodeCoords[sId] && !nodeCoords[tId]) {
          const tNode = rawNodes.find(n => String(n.data?.id ?? n.id) === tId);
          if (tNode) {
            const tData = tNode.data || tNode;
            const c = nodeCoords[sId].coords;
            const jx = (Math.random() - 0.5) * 0.015;
            const jy = (Math.random() - 0.5) * 0.015;
            const newCoords = [c[0] + jx, c[1] + jy];
            nodeCoords[tId] = { ...tData, id: tId, coords: newCoords };
            geoNodes.push({ ...tData, id: tId, coords: newCoords });
          }
        }
      });
    }

    // 3. Construct spatial polyline connections between geolocated nodes
    rawEdges.forEach((e, idx) => {
      const data = e.data || e;
      const sId = String(data.source);
      const tId = String(data.target);

      if (nodeCoords[sId] && nodeCoords[tId]) {
        geoEdges.push({
          id: data.id || `geo_edge_${sId}_${tId}_${idx}`,
          sourceCoords: nodeCoords[sId].coords,
          targetCoords: nodeCoords[tId].coords,
          type: data.type || data.label || 'CONNECTED',
          sourceName: nodeCoords[sId].label || nodeCoords[sId].name || sId,
          targetName: nodeCoords[tId].label || nodeCoords[tId].name || tId,
        });
      }
    });

    return { geoNodes, geoEdges };
  }, [nodes, edges]);

  if (mapData.geoNodes.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#05050f] text-gray-400">
        <div 
          className="w-16 h-16 opacity-50" 
          dangerouslySetInnerHTML={{ __html: ICONS.LOCATION }} 
        />
        <p className="mt-4 text-sm font-medium">No geospatial data available for Map View.</p>
        <p className="text-xs mt-2 text-gray-500">Entities must have LOCATION or SPOTTED_AT links.</p>
      </div>
    );
  }

  // Calculate default center
  const defaultCenter = mapData.geoNodes.length > 0 ? mapData.geoNodes[0].coords : [19.0760, 72.8777];

  // Calculate how many nodes are in fence
  const nodesInFence = mapData.geoNodes.filter(n => {
    if (!geofenceCenter) return true;
    return L.latLng(geofenceCenter).distanceTo(L.latLng(n.coords)) <= geofenceRadius;
  });

  return (
    <div className="w-full h-full relative z-0">
      {/* Geofence UI Panel */}
      <div className="absolute top-4 left-4 z-[400] bg-[var(--bg-primary)] p-4 rounded-xl border border-[var(--border)] shadow-[0_0_20px_rgba(0,0,0,0.6)] backdrop-blur-md bg-opacity-95 min-w-[260px]">
        <h3 className="text-xs font-bold text-[var(--neon-gold)] uppercase tracking-wider mb-2 flex justify-between items-center">
          <span>Target Geofence Radar</span>
          {geofenceCenter && (
            <button onClick={() => setGeofenceCenter(null)} className="text-[10px] text-[var(--text-accent)] hover:text-white bg-[#1e3a5f] px-2 py-0.5 rounded font-bold">Clear</button>
          )}
        </h3>
        
        {!geofenceCenter ? (
          <p className="text-xs text-[var(--text-secondary)] opacity-80 leading-relaxed">
            Click anywhere on the map to drop a dynamic surveillance geofence.
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between text-xs text-[var(--text-secondary)]">
              <span>Perimeter Radius:</span>
              <strong className="text-white">{(geofenceRadius / 1000).toFixed(1)} km</strong>
            </div>
            <input 
              type="range" 
              min="1000" 
              max="100000" 
              step="1000"
              value={geofenceRadius} 
              onChange={(e) => setGeofenceRadius(Number(e.target.value))}
              className="w-full h-1 bg-[var(--bg-highlight)] rounded-lg appearance-none cursor-pointer"
              style={{ accentColor: 'var(--neon-gold)' }}
            />
            <div className="pt-2 border-t border-[var(--border)] flex justify-between items-center">
               <span className="text-xs text-[var(--text-secondary)]">Tracked in Perimeter:</span>
               <strong className="text-[var(--neon-teal)] text-sm font-bold">{nodesInFence.length} / {mapData.geoNodes.length}</strong>
            </div>
          </div>
        )}
      </div>

      <MapContainer 
        center={defaultCenter} 
        zoom={6} 
        style={{ width: '100%', height: '100%', background: '#05050f' }}
        zoomControl={false}
      >
        <MapBoundsFitter geoNodes={mapData.geoNodes} />
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
            pathOptions={{ color: '#ffd32a', fillColor: '#ffd32a', fillOpacity: 0.12, weight: 2, dashArray: '6 6' }} 
          />
        )}

        {mapData.geoEdges.map(edge => {
          const inFence1 = !geofenceCenter || L.latLng(geofenceCenter).distanceTo(L.latLng(edge.sourceCoords)) <= geofenceRadius;
          const inFence2 = !geofenceCenter || L.latLng(geofenceCenter).distanceTo(L.latLng(edge.targetCoords)) <= geofenceRadius;
          const inFence = inFence1 && inFence2;
          
          let color = '#00d2d3';
          if (edge.type === 'TRANSFERRED_MONEY_TO') color = '#ffd32a';
          else if (edge.type === 'SPOTTED_AT') color = '#54a0ff';
          else if (edge.type === 'COMMANDS' || edge.type === 'THREATENED') color = '#ff4757';

          return (
            <Polyline 
              key={edge.id}
              positions={[edge.sourceCoords, edge.targetCoords]}
              pathOptions={{ color, weight: 2.5, dashArray: '6 4', opacity: inFence ? 0.75 : 0.15 }}
            >
              <Popup className="custom-leaflet-popup">
                <div className="bg-[#111] text-white p-2 rounded border border-[#333] text-xs">
                  <span className="text-[var(--neon-teal)] font-bold">{edge.type}</span>
                  <div className="text-gray-300 mt-1">{edge.sourceName} ➔ {edge.targetName}</div>
                </div>
              </Popup>
            </Polyline>
          );
        })}

        {mapData.geoNodes.map(node => {
          const isSelected = selectedEntity && (String(selectedEntity.id) === String(node.id) || String(selectedEntity.data?.id) === String(node.id));
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
                <div className="bg-[#111] text-white p-2 rounded border border-[#333] min-w-[140px]">
                  <strong className="text-[var(--text-accent)] block text-xs mb-1">{node.label || node.name || node.id}</strong>
                  <span className="text-[10px] uppercase font-bold text-gray-400 bg-[#222] px-1.5 py-0.5 rounded">{node.type}</span>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Global styles for dark theme Leaflet map */}
      <style>{`
        .leaflet-container { font-family: inherit; }
        .leaflet-popup-content-wrapper, .leaflet-popup-tip { background: #111; color: white; border: 1px solid #333; }
        .leaflet-popup-content { margin: 0; }
        .leaflet-popup-close-button { display: none; }
        .map-tiles { filter: invert(100%) hue-rotate(180deg) brightness(90%) contrast(90%); }
      `}</style>
    </div>
  );
}
