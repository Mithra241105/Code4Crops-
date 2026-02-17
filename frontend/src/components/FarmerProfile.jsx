import React, { useState, useEffect } from 'react';
import {
    Drawer,
    Box,
    Typography,
    TextField,
    Button,
    IconButton,
    Divider,
    Avatar,
    Chip,
} from '@mui/material';
// Icons removed
import { saveProfile, getProfile } from '../services/storage';

const FarmerProfile = ({ open, onClose }) => {
    const [profile, setProfile] = useState({
        name: '',
        village: '',
        phone: '',
    });

    useEffect(() => {
        const savedProfile = getProfile();
        if (savedProfile) {
            setProfile(savedProfile);
        }
    }, [open]);

    const handleSave = () => {
        saveProfile(profile);
        onClose();
    };

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box sx={{ width: 350, p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span style={{ fontSize: 24 }}>👤</span> Profile
                    </Typography>
                    <IconButton onClick={onClose}>
                        <span>✖️</span>
                    </IconButton>
                </Box>

                <Box textAlign="center" mb={3}>
                    <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: '2rem' }}>
                        {profile.name ? profile.name[0].toUpperCase() : '👤'}
                    </Avatar>
                    {profile.name && (
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Welcome, {profile.name}!
                        </Typography>
                    )}
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box display="flex" flexDirection="column" gap={2}>
                    <TextField
                        label="Name"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        fullWidth
                    />
                    <TextField
                        label="Village/Location"
                        value={profile.village}
                        onChange={(e) => setProfile({ ...profile, village: e.target.value })}
                        fullWidth
                    />
                    <TextField
                        label="Phone Number"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        fullWidth
                    />

                    <Button
                        variant="contained"
                        startIcon={<span>💾</span>}
                        onClick={handleSave}
                        fullWidth
                        sx={{ mt: 2 }}
                    >
                        Save Profile
                    </Button>
                </Box>
            </Box>
        </Drawer>
    );
};

export default FarmerProfile;
