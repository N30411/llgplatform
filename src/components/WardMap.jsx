import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER = [-6.6737845392346555, 146.9923187273306]; // Ahi Rural LLG center



// Rectangle polygon around the center (approximate area, adjust as needed)
const samplePolygon = [
  [-6.65, 146.96],
  [-6.65, 147.02],
  [-6.70, 147.02],
  [-6.70, 146.96],
];

const WardMap = ({ center = DEFAULT_CENTER, zoom = 12, markers = [], polygons = [
  { positions: samplePolygon, color: '#3b82f6', label: 'Ahi Rural LLG Area' }
] }) => {
  return (
    <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} style={{ width: '100%', height: '100%', minHeight: 240, borderRadius: '0.75rem' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {polygons.map((poly, i) => (
        <Polygon key={i} positions={poly.positions} pathOptions={{ color: poly.color, fillOpacity: 0.4 }}>
          <Popup>{poly.label}</Popup>
        </Polygon>
      ))}
      {markers.map((m, i) => (
        <Marker key={i} position={m.position}>
          <Popup>{m.label}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default WardMap;
