import React, { useState } from 'react';
import {
    Card,
    CardContent,
    TextField,
    Select,
    MenuItem,
    Button,
    Typography,
    FormControl,
    InputLabel,
    Box,
    CircularProgress
} from '@mui/material';
// Icons removed

const InputForm = ({ onOptimize, loading }) => {
    const [quantity, setQuantity] = useState('');
    const [vehicleType, setVehicleType] = useState('bike');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (quantity && vehicleType) {
            onOptimize(parseFloat(quantity), vehicleType);
        }
    };

    return (
        <Box sx={{ maxWidth: 900, mx: 'auto', px: 3, py: 6 }}>
            <Card elevation={3}>
                <CardContent sx={{ p: 4 }}>
                    <Typography variant="h4" gutterBottom align="center" color="primary" sx={{ mb: 4, fontWeight: 600 }}>
                        Optimize Your Route
                    </Typography>

                    <form onSubmit={handleSubmit}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <TextField
                                label="Quantity (kg)"
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder="Enter quantity in kilograms"
                                required
                                fullWidth
                                inputProps={{ min: 1, step: 0.01 }}
                                variant="outlined"
                            />

                            <FormControl fullWidth required>
                                <InputLabel>Vehicle Type</InputLabel>
                                <Select
                                    value={vehicleType}
                                    label="Vehicle Type"
                                    onChange={(e) => setVehicleType(e.target.value)}
                                >
                                    <MenuItem value="bike">Bike (₹5/km)</MenuItem>
                                    <MenuItem value="auto">Auto (₹8/km)</MenuItem>
                                    <MenuItem value="miniTruck">Mini Truck (₹12/km)</MenuItem>
                                    <MenuItem value="tractor">Tractor (₹15/km)</MenuItem>
                                </Select>
                            </FormControl>

                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                size="large"
                                disabled={loading}
                                fullWidth
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <span>🚀</span>}
                                sx={{
                                    py: 1.5,
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                }}
                            >
                                {loading ? 'Optimizing...' : 'Optimize Route'}
                            </Button>
                        </Box>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
};

export default InputForm;
