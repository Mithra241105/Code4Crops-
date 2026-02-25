import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, Typography, Button, Chip } from '@mui/material';
import { DirectionsCar } from '@mui/icons-material';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const farmerIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const bestMandiIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const otherMandiIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [20, 33], iconAnchor: [10, 33], popupAnchor: [1, -30], shadowSize: [33, 33],
});

const FitBounds = ({ farmerLat, farmerLng, mandis }) => {
    const map = useMap();
    useEffect(() => {
        const points = [[farmerLat, farmerLng], ...mandis.slice(0, 5).map(m => [m.location.lat, m.location.lng])];
        if (points.length > 1) map.fitBounds(points, { padding: [30, 30] });
    }, [farmerLat, farmerLng]);
    return null;
};

const MapView = ({ farmerLat, farmerLng, mandis = [], bestMandi }) => {
    if (!farmerLat || !farmerLng) return null;

    const validMandis = mandis.filter(m => m.location?.lat && m.location?.lng);

    return (
        <Box>
            <Box sx={{ height: 380 }}>
                <MapContainer center={[farmerLat, farmerLng]} zoom={8} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <FitBounds farmerLat={farmerLat} farmerLng={farmerLng} mandis={validMandis} />

                    {/* Farmer marker */}
                    <Marker position={[farmerLat, farmerLng]} icon={farmerIcon}>
                        <Popup><strong>Your Location</strong><br />{farmerLat.toFixed(4)}, {farmerLng.toFixed(4)}</Popup>
                    </Marker>

                    {/* Mandi markers */}
                    {validMandis.slice(0, 8).map((mandi, i) => (
                        <Marker
                            key={mandi.mandiId || i}
                            position={[mandi.location.lat, mandi.location.lng]}
                            icon={i === 0 ? bestMandiIcon : otherMandiIcon}
                        >
                            <Popup>
                                <Box>
                                    <Typography variant="body2" fontWeight={700}>{mandi.mandiName}</Typography>
                                    <Typography variant="caption">Rank #{mandi.rank} • {mandi.distance} km</Typography><br />
                                    <Typography variant="caption" color="success.main">Profit: ₹{mandi.netProfit?.toLocaleString('en-IN')}</Typography><br />
                                    <Button
                                        size="small" variant="contained" sx={{ mt: 1, fontSize: '0.7rem', py: 0.3 }}
                                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${mandi.location.lat},${mandi.location.lng}`, '_blank')}
                                    >
                                        Navigate
                                    </Button>
                                </Box>
                            </Popup>
                        </Marker>
                    ))}

                    {/* Line from farmer to best mandi */}
                    {bestMandi?.location?.lat && (
                        <Polyline
                            positions={[[farmerLat, farmerLng], [bestMandi.location.lat, bestMandi.location.lng]]}
                            pathOptions={{ color: '#2E7D32', weight: 3, dashArray: '8,4', opacity: 0.8 }}
                        />
                    )}
                </MapContainer>
            </Box>

            {bestMandi && (
                <Box sx={{ p: 2, bgcolor: '#E8F5E9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                    <Box>
                        <Typography variant="body2" color="text.secondary">Best Route</Typography>
                        <Typography variant="body1" fontWeight={700}>{bestMandi.mandiName} • {bestMandi.distance} km</Typography>
                    </Box>
                    <Button
                        variant="contained" size="small"
                        startIcon={<DirectionsCar />}
                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${bestMandi.location.lat},${bestMandi.location.lng}`, '_blank')}
                    >
                        Navigate in Google Maps
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default MapView;
