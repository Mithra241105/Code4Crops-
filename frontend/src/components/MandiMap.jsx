import React, { useEffect, useRef } from 'react';
import { Card, CardContent, Typography, Box, Chip, Fade } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { formatCurrency } from '../utils/calculations';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom green pulsing marker for recommended mandi
const greenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    className: 'pulsing-marker',
});

// Red marker for other mandis
const redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

// Component to auto-fit bounds
const FitBounds = ({ bounds }) => {
    const map = useMap();
    useEffect(() => {
        if (bounds && bounds.length > 0) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [bounds, map]);
    return null;
};

const MandiMap = ({ mandis, farmerLocation }) => {
    if (!mandis || mandis.length === 0) {
        return (
            <Card elevation={4}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h5" color="primary" gutterBottom sx={{ fontWeight: 700 }}>
                        📍 Mandi Locations
                    </Typography>
                    <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5', borderRadius: 2 }}>
                        <Typography color="text.secondary">No mandis to display</Typography>
                    </Box>
                </CardContent>
            </Card>
        );
    }

    const topMandi = mandis[0];
    const farmerCoords = farmerLocation?.coordinates || [28.6139, 77.2090];

    // Calculate bounds to include farmer location and all mandis
    const allPoints = [
        farmerCoords,
        ...mandis.map(m => m.coordinates),
    ];

    // Route line to best mandi
    const routeCoordinates = [
        farmerCoords,
        topMandi.coordinates,
    ];

    return (
        <Fade in timeout={1000}>
            <Card elevation={4}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h5" color="primary" gutterBottom sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                        📍 Mandi Locations
                    </Typography>

                    <Box sx={{ height: 450, borderRadius: 2, overflow: 'hidden', border: '2px solid #E0E0E0', position: 'relative' }}>
                        <MapContainer
                            center={farmerCoords}
                            zoom={8}
                            style={{ height: '100%', width: '100%' }}
                            scrollWheelZoom={true}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            <FitBounds bounds={allPoints} />

                            {/* Animated route to best mandi */}
                            <Polyline
                                positions={routeCoordinates}
                                pathOptions={{
                                    color: '#2E7D32',
                                    weight: 4,
                                    opacity: 0.8,
                                    dashArray: '10, 10',
                                    className: 'animated-route',
                                }}
                            />

                            {/* Farmer location marker */}
                            <Marker position={farmerCoords}>
                                <Popup>
                                    <Box sx={{ p: 1 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1976d2' }}>
                                            📍 Your Location
                                        </Typography>
                                        <Typography variant="caption">
                                            {farmerLocation?.name || 'Current Location'}
                                        </Typography>
                                    </Box>
                                </Popup>
                            </Marker>

                            {/* Mandi markers */}
                            {mandis.slice(0, 15).map((mandi, index) => (
                                <Marker
                                    key={mandi.id}
                                    position={mandi.coordinates}
                                    icon={index === 0 ? greenIcon : redIcon}
                                >
                                    <Popup>
                                        <Box sx={{ p: 1, minWidth: 200 }}>
                                            <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                                                {mandi.name}
                                            </Typography>
                                            <Box display="flex" flexDirection="column" gap={0.5}>
                                                <Typography variant="caption" color="text.secondary">
                                                    <strong>Distance:</strong> {mandi.distance} km ({mandi.travelTime})
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    <strong>Price:</strong> ₹{mandi.price}/kg
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#2E7D32', fontWeight: 700 }}>
                                                    <strong>Net Profit:</strong> {formatCurrency(mandi.netProfit)}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    <strong>Risk:</strong> {mandi.riskLevel}
                                                </Typography>
                                            </Box>
                                            {index === 0 && (
                                                <Chip
                                                    label="🏆 Recommended"
                                                    color="success"
                                                    size="small"
                                                    sx={{ mt: 1, fontWeight: 600 }}
                                                />
                                            )}
                                        </Box>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </Box>

                    {/* Legend */}
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 16, height: 16, bgcolor: '#4CAF50', borderRadius: '50%', boxShadow: '0 0 10px rgba(76, 175, 80, 0.6)' }} />
                            <Typography variant="caption" color="text.secondary">Recommended Mandi</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 16, height: 16, bgcolor: '#F44336', borderRadius: '50%' }} />
                            <Typography variant="caption" color="text.secondary">Other Mandis</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 16, height: 16, bgcolor: '#1976d2', borderRadius: '50%' }} />
                            <Typography variant="caption" color="text.secondary">Your Location</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 24, height: 3, bgcolor: '#2E7D32', borderRadius: 1 }} />
                            <Typography variant="caption" color="text.secondary">Best Route</Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Fade>
    );
};

export default MandiMap;
