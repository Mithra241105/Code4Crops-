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
    CircularProgress,
    Grid,
    InputAdornment,
    Fade,
    Grow,
} from '@mui/material';
// Icons removed - using emojis instead for compatibility
import { cropTypes, farmerLocations, vehicleTypes } from '../utils/mockData';

// Dynamic crop icon mapping
const getCropIcon = (cropType) => {
    const iconMap = {
        'Wheat': '🌾',
        'Rice': '🌾',
        'Barley': '🌾',
        'Maize': '🌽',
        'Bajra': '🌾',
        'Jowar': '🌾',
        'Cotton': '🌸',
        'Sugarcane': '🎋',
        'Mustard': '🌼',
        'Potato': '🥔',
        'Tomato': '🍅',
        'Onion': '🧅',
    };
    return iconMap[cropType] || '🌾';
};

// Vehicle icon mapping
const getVehicleIcon = (vehicleType) => {
    const iconMap = {
        'bike': '🏍️',
        'auto': '🚗',
        'miniTruck': '🚚',
        'tractor': '🚜',
        'truck': '🚛',
    };
    return iconMap[vehicleType] || '🚚';
};

const OptimizeForm = ({ onOptimize, loading }) => {
    const [formData, setFormData] = useState({
        cropType: '',
        quantity: '',
        vehicleType: 'miniTruck',
        fuelPrice: '100',
        handlingCost: '2',
        farmerLocation: '',
    });

    const [errors, setErrors] = useState({});

    const handleChange = (field) => (event) => {
        setFormData({
            ...formData,
            [field]: event.target.value,
        });
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.cropType) newErrors.cropType = 'Please select a crop type';
        if (!formData.quantity || formData.quantity <= 0) newErrors.quantity = 'Please enter a valid quantity';
        if (!formData.vehicleType) newErrors.vehicleType = 'Please select a vehicle type';
        if (!formData.fuelPrice || formData.fuelPrice <= 0) newErrors.fuelPrice = 'Please enter a valid fuel price';
        if (!formData.farmerLocation) newErrors.farmerLocation = 'Please select your location';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onOptimize(formData);
        }
    };

    return (
        <Box sx={{ maxWidth: 1000, mx: 'auto', px: 3, py: 6 }}>
            <Fade in timeout={800}>
                <Card
                    elevation={8}
                    sx={{
                        background: 'linear-gradient(135deg, #ffffff 0%, #f4fdf4 100%)',
                        borderRadius: 4,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            boxShadow: '0 12px 32px rgba(46, 125, 50, 0.15)',
                        },
                    }}
                >
                    <CardContent sx={{ p: 5 }}>
                        <Box textAlign="center" mb={5}>
                            <Box
                                sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: '50%',
                                    bgcolor: '#E8F5E9',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 2,
                                }}
                            >
                                <span style={{ fontSize: 48 }}>🚜</span>
                            </Box>
                            <Typography variant="h4" gutterBottom color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                                Optimize Your Route
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.05rem' }}>
                                Enter your details to find the most profitable mandi
                            </Typography>
                        </Box>

                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={3}>
                                {/* Crop Type */}
                                <Grid item xs={12} md={6}>
                                    <Grow in timeout={600}>
                                        <FormControl fullWidth required error={!!errors.cropType}>
                                            <InputLabel id="crop-type-label" sx={{ bgcolor: 'white', px: 1 }}>Crop Type</InputLabel>
                                            <Select
                                                labelId="crop-type-label"
                                                value={formData.cropType}
                                                label="Crop Type"
                                                onChange={handleChange('cropType')}
                                                renderValue={(selected) => (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <span>{getCropIcon(selected)}</span> {selected}
                                                    </Box>
                                                )}
                                                sx={{
                                                    borderRadius: 2,
                                                    height: 56,
                                                }}
                                            >
                                                {cropTypes.map((crop) => (
                                                    <MenuItem key={crop} value={crop}>
                                                        <Box display="flex" alignItems="center" gap={1.5}>
                                                            {getCropIcon(crop)}
                                                            <Typography>{crop}</Typography>
                                                        </Box>
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {errors.cropType && (
                                                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                                                    {errors.cropType}
                                                </Typography>
                                            )}
                                        </FormControl>
                                    </Grow>
                                </Grid>

                                {/* Quantity */}
                                <Grid item xs={12} md={6}>
                                    <Grow in timeout={700}>
                                        <TextField
                                            label="Quantity"
                                            type="number"
                                            value={formData.quantity}
                                            onChange={handleChange('quantity')}
                                            placeholder="Enter quantity"
                                            required
                                            fullWidth
                                            error={!!errors.quantity}
                                            helperText={errors.quantity || 'Total produce to sell'}
                                            inputProps={{ min: 1, step: 0.01 }}
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    height: 56,
                                                },
                                            }}
                                        />
                                    </Grow>
                                </Grid>

                                {/* Vehicle Type */}
                                <Grid item xs={12} md={6}>
                                    <Grow in timeout={800}>
                                        <FormControl fullWidth required error={!!errors.vehicleType}>
                                            <InputLabel id="vehicle-type-label" sx={{ bgcolor: 'white', px: 1 }}>Vehicle Type</InputLabel>
                                            <Select
                                                labelId="vehicle-type-label"
                                                value={formData.vehicleType}
                                                label="Vehicle Type"
                                                onChange={handleChange('vehicleType')}
                                                renderValue={(selected) => {
                                                    const vehicle = vehicleTypes.find(v => v.value === selected);
                                                    return (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <span>{getVehicleIcon(selected)}</span> {vehicle?.label}
                                                        </Box>
                                                    );
                                                }}
                                                sx={{
                                                    borderRadius: 2,
                                                    height: 56,
                                                }}
                                            >
                                                {vehicleTypes.map((vehicle) => (
                                                    <MenuItem key={vehicle.value} value={vehicle.value}>
                                                        <Box display="flex" alignItems="center" gap={1.5}>
                                                            {getVehicleIcon(vehicle.value)}
                                                            <Typography>{vehicle.label} (₹{vehicle.costPerKm}/km)</Typography>
                                                        </Box>
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grow>
                                </Grid>

                                {/* Fuel Price */}
                                <Grid item xs={12} md={6}>
                                    <Grow in timeout={900}>
                                        <TextField
                                            label="Fuel Price"
                                            type="number"
                                            value={formData.fuelPrice}
                                            onChange={handleChange('fuelPrice')}
                                            placeholder="Current fuel price"
                                            required
                                            fullWidth
                                            error={!!errors.fuelPrice}
                                            helperText={errors.fuelPrice || 'Current market price per litre'}
                                            inputProps={{ min: 1, step: 0.1 }}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start" sx={{ mr: 1 }}>
                                                        <span>⛽</span>
                                                    </InputAdornment>
                                                ),
                                                endAdornment: <InputAdornment position="end">₹/L</InputAdornment>,
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    height: 56,
                                                },
                                            }}
                                        />
                                    </Grow>
                                </Grid>

                                {/* Handling Cost */}
                                <Grid item xs={12} md={6}>
                                    <Grow in timeout={1000}>
                                        <TextField
                                            label="Handling Cost (Optional)"
                                            type="number"
                                            value={formData.handlingCost}
                                            onChange={handleChange('handlingCost')}
                                            placeholder="Cost per kg"
                                            fullWidth
                                            inputProps={{ min: 0, step: 0.1 }}
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">₹/kg</InputAdornment>,
                                            }}
                                            helperText="Loading, unloading, and packaging costs"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    height: 56,
                                                },
                                            }}
                                        />
                                    </Grow>
                                </Grid>

                                {/* Farmer Location */}
                                <Grid item xs={12} md={6}>
                                    <Grow in timeout={1100}>
                                        <FormControl fullWidth required error={!!errors.farmerLocation}>
                                            <InputLabel id="farmer-location-label" sx={{ bgcolor: 'white', px: 1 }}>Your Location</InputLabel>
                                            <Select
                                                labelId="farmer-location-label"
                                                value={formData.farmerLocation}
                                                label="Your Location"
                                                onChange={handleChange('farmerLocation')}
                                                renderValue={(selected) => (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <span>📍</span> {selected}
                                                    </Box>
                                                )}
                                                sx={{
                                                    borderRadius: 2,
                                                    height: 56,
                                                }}
                                            >
                                                {farmerLocations.map((location) => (
                                                    <MenuItem key={location.name} value={location.name}>
                                                        {location.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {errors.farmerLocation && (
                                                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                                                    {errors.farmerLocation}
                                                </Typography>
                                            )}
                                        </FormControl>
                                    </Grow>
                                </Grid>

                                {/* Submit Button */}
                                <Grid item xs={12}>
                                    <Grow in timeout={1200}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            color="primary"
                                            size="large"
                                            disabled={loading}
                                            fullWidth
                                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <span>📈</span>}
                                            sx={{
                                                py: 2,
                                                fontSize: '1.1rem',
                                                fontWeight: 700,
                                                borderRadius: 2,
                                                background: loading ? undefined : 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
                                                boxShadow: loading ? undefined : '0 8px 20px rgba(46, 125, 50, 0.3)',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                '&:hover': {
                                                    transform: loading ? 'none' : 'translateY(-2px) scale(1.02)',
                                                    boxShadow: loading ? undefined : '0 12px 28px rgba(46, 125, 50, 0.4)',
                                                },
                                                '&:active': {
                                                    transform: 'translateY(0) scale(1)',
                                                },
                                            }}
                                        >
                                            {loading ? 'Optimizing Your Route...' : 'Find Best Mandi'}
                                        </Button>
                                    </Grow>
                                </Grid>
                            </Grid>
                        </form>
                    </CardContent>
                </Card>
            </Fade>
        </Box >
    );
};

export default OptimizeForm;
