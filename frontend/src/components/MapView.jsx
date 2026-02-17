import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom green marker for recommended mandi
const greenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Default red marker for other mandis
const redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const MapView = ({ mandis }) => {
    const defaultCenter = [28.6139, 77.2090]; // Delhi, India

    if (!mandis || mandis.length === 0) {
        return (
            <Card elevation={3}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h5" color="primary" gutterBottom align="center" sx={{ mb: 2, fontWeight: 600 }}>
                        Mandi Locations
                    </Typography>
                    <Box
                        sx={{
                            height: 400,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: '#f5f5f5',
                            borderRadius: 2,
                        }}
                    >
                        <Typography color="text.secondary">No mandis to display</Typography>
                    </Box>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card elevation={3}>
            <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" color="primary" gutterBottom align="center" sx={{ mb: 2, fontWeight: 600 }}>
                    Mandi Locations
                </Typography>
                <Box sx={{ height: 400, borderRadius: 2, overflow: 'hidden', border: '2px solid #E0E0E0' }}>
                    <MapContainer
                        center={defaultCenter}
                        zoom={6}
                        style={{ height: '100%', width: '100%' }}
                        scrollWheelZoom={true}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {mandis.map((mandi, index) => {
                            const lat = defaultCenter[0] + (Math.random() - 0.5) * 2;
                            const lng = defaultCenter[1] + (Math.random() - 0.5) * 2;

                            return (
                                <Marker
                                    key={index}
                                    position={[lat, lng]}
                                    icon={index === 0 ? greenIcon : redIcon}
                                >
                                    <Popup>
                                        <Box sx={{ p: 1 }}>
                                            <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 700 }}>
                                                {mandi.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Distance: {mandi.distance} km
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Price: ₹{mandi.price}/kg
                                            </Typography>
                                            <Typography variant="body2" color="success.main" sx={{ fontWeight: 700 }}>
                                                Net Profit: ₹{mandi.netProfit.toFixed(2)}
                                            </Typography>
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
                            );
                        })}
                    </MapContainer>
                </Box>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 16, height: 16, bgcolor: '#4CAF50', borderRadius: '50%' }} />
                        <Typography variant="body2" color="text.secondary">Recommended Mandi</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 16, height: 16, bgcolor: '#F44336', borderRadius: '50%' }} />
                        <Typography variant="body2" color="text.secondary">Other Mandis</Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default MapView;
