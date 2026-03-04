import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const InternalPicker = ({ position, onPick }) => {
    useMapEvents({
        click(e) {
            onPick(e.latlng.lat, e.latlng.lng);
        },
    });
    return position ? <Marker position={position} /> : null;
};

const LocationPickerMap = ({ position, onPick, height = '400px', zoom = 12 }) => {
    // Default center to India if no position
    const center = position || [20.5937, 78.9629];
    const actualZoom = position ? zoom : 5;

    return (
        <MapContainer
            center={center}
            zoom={actualZoom}
            style={{ height, width: '100%' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <InternalPicker position={position} onPick={onPick} />
        </MapContainer>
    );
};

export default LocationPickerMap;
