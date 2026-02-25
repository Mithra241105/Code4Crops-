import React, { useEffect, useState } from 'react';
import {
    Container, Box, Typography, Card, CardContent, Chip, Alert,
    CircularProgress, Switch, FormControlLabel, Divider, Grid,
    IconButton, TextField, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, Tooltip, MenuItem, InputAdornment,
    Snackbar
} from '@mui/material';
import {
    Store, CheckCircle, Cancel, TrendingUp, Edit, Delete,
    Add, Save, Close, LocalOffer, Agriculture
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const ALL_CROPS = [
    'wheat', 'rice', 'maize', 'onion', 'potato', 'tomato', 'cotton',
    'soybean', 'mustard', 'groundnut', 'garlic', 'chilli', 'banana',
    'orange', 'millet', 'ragi', 'castor', 'grapes', 'guar', 'bajra',
    'brinjal', 'jute', 'coconut'
];

const MandiOverviewPage = () => {
    const { t } = useTranslation();
    const { user } = useAuth();

    // Mandi state
    const [mandi, setMandi] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState(false);

    // Crop Management State
    const [crops, setCrops] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');

    // Add Crop State
    const [addOpen, setAddOpen] = useState(false);
    const [newCrop, setNewCrop] = useState({ name: '', price: '', available: true });

    // Delete State
    const [deleteTarget, setDeleteTarget] = useState(null);

    // UI State
    const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/mandi/admin/profile');
            setMandi(data.mandi);

            // Re-map crop prices for our interactive UI
            if (data.mandi) {
                const prices = data.mandi.cropPrices || {};
                const supported = data.mandi.supportedCrops || [];
                const list = supported.map(c => ({
                    id: c,
                    name: c,
                    price: prices[c] || 0,
                    available: true
                }));
                setCrops(list);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchProfile(); }, []);

    const toggleAvailability = async () => {
        if (!mandi) return;
        setToggling(true);
        try {
            const { data } = await api.put('/mandi/admin/availability', { isOpen: !mandi.isOpen });
            setMandi(data.mandi);
            showSnack(t('mandi.statusUpdated'), 'success');
        } catch {
            showSnack(t('common.error'), 'error');
        } finally { setToggling(false); }
    };

    const showSnack = (msg, severity = 'success') => {
        setSnack({ open: true, msg, severity });
    };

    // ── Crop CRUD ───────────────────────────────────────────────

    const startEdit = (crop) => {
        setEditingId(crop.id);
        setEditValue(crop.price);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditValue('');
    };

    const saveEdit = async (cropId) => {
        try {
            await api.put(`/mandi/crops/${cropId}`, { price: Number(editValue) });
            setCrops(prev => prev.map(c => c.id === cropId ? { ...c, price: Number(editValue) } : c));
            setEditingId(null);
            showSnack(t('mandi.priceUpdated'), 'success');
        } catch {
            showSnack(t('common.error'), 'error');
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await api.delete(`/mandi/crops/${deleteTarget.id}`);
            setCrops(prev => prev.filter(c => c.id !== deleteTarget.id));
            setDeleteTarget(null);
            showSnack(t('mandi.cropDeleted'), 'success');
        } catch {
            showSnack(t('common.error'), 'error');
        }
    };

    const handleAdd = async () => {
        if (!newCrop.name || !newCrop.price) return;
        try {
            const { data } = await api.post('/mandi/crops', newCrop);
            setCrops(prev => [...prev, data.crop]);
            setAddOpen(false);
            setNewCrop({ name: '', price: '', available: true });
            showSnack(t('mandi.cropAdded'), 'success');
        } catch (err) {
            showSnack(err.response?.data?.error || t('common.error'), 'error');
        }
    };

    if (loading) return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box mb={4} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                <Box>
                    <Typography variant="h4" fontWeight={800}>{t('mandi.title')}</Typography>
                    <Typography variant="body1" color="text.secondary">{t('mandi.welcome', { name: user?.name })}</Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setAddOpen(true)}
                    sx={{ borderRadius: 2, px: 3 }}
                >
                    {t('mandi.addCrop')}
                </Button>
            </Box>

            {!mandi && (
                <Alert severity="info" sx={{ mb: 3 }}>
                    Complete your mandi profile to start appearing in farmer searches. Go to the Profile tab to set up.
                </Alert>
            )}

            {mandi && (
                <>
                    {/* Status card */}
                    <Card sx={{ mb: 3, border: mandi.isOpen ? '2.5px solid #2E7D32' : '1px solid #E0E0E0', borderRadius: 3 }}>
                        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, p: 3 }}>
                            <Box display="flex" alignItems="center" gap={2}>
                                <Box sx={{
                                    width: 56, height: 56, borderRadius: '50%',
                                    bgcolor: mandi.isOpen ? '#E8F5E9' : '#FAFAFA',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'background-color 0.3s ease'
                                }}>
                                    {mandi.isOpen ? <CheckCircle color="success" sx={{ fontSize: 32 }} /> : <Cancel color="disabled" sx={{ fontSize: 32 }} />}
                                </Box>
                                <Box>
                                    <Typography variant="h5" fontWeight={800}>{mandi.name}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {mandi.location?.city && `${mandi.location.city} • `}
                                        {crops.length} {t('mandi.cropsSupported')}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box display="flex" alignItems="center" gap={1}>
                                <Typography fontWeight={800} color={mandi.isOpen ? 'success.main' : 'text.disabled'}>
                                    {mandi.isOpen ? t('mandi.isOpen').toUpperCase() : t('mandi.isClosed').toUpperCase()}
                                </Typography>
                                <Switch checked={mandi.isOpen} onChange={toggleAvailability} disabled={toggling} color="success" />
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Quick stats */}
                    <Grid container spacing={2} mb={4}>
                        {[
                            { label: t('mandi.demandScore'), value: `${mandi.demandScore}/100`, color: '#2E7D32', icon: <TrendingUp /> },
                            { label: t('mandi.handlingRate'), value: `₹${mandi.handlingRate}/qtl`, color: '#F57F17', icon: <LocalOffer /> },
                            { label: t('mandi cropsListed'), value: crops.length, color: '#1565C0', icon: <Agriculture /> },
                            { label: t('Common Status'), value: mandi.isOpen ? t('Common Open') : t('common.closed'), color: mandi.isOpen ? '#2E7D32' : '#B71C1C', icon: <Store /> },
                        ].map((stat, i) => (
                            <Grid item xs={6} sm={3} key={i}>
                                <Card sx={{ textAlign: 'center', p: 2.5, height: '100%', borderRadius: 2 }}>
                                    <Box color={stat.color} sx={{ mb: 1 }}>{stat.icon}</Box>
                                    <Typography variant="h5" fontWeight={800} color={stat.color}>{stat.value}</Typography>
                                    <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                        {stat.label}
                                    </Typography>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Crop management section */}
                    <Card sx={{ borderRadius: 3 }}>
                        <CardContent sx={{ p: 4 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                <Typography variant="h6" fontWeight={800}>{t('mandi.activePrices')}</Typography>
                            </Box>

                            {crops.length === 0 ? (
                                <Box textAlign="center" py={4} bgcolor="#F5F5F5" borderRadius={2}>
                                    <Agriculture sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                                    <Typography color="text.secondary">{t('mandi.noCrops')}</Typography>
                                    <Button size="small" onClick={() => setAddOpen(true)} sx={{ mt: 1 }}>{t('mandi.addOneNow')}</Button>
                                </Box>
                            ) : (
                                <Box display="flex" flexWrap="wrap" gap={2}>
                                    {crops.map((crop) => (
                                        <Box key={crop.id}>
                                            {editingId === crop.id ? (
                                                <Paper elevation={0} sx={{
                                                    p: 0.5, pl: 2, display: 'flex', alignItems: 'center',
                                                    gap: 1, border: '2px solid', borderColor: 'primary.main',
                                                    borderRadius: 10, bgcolor: 'primary.50'
                                                }}>
                                                    <Typography variant="body2" fontWeight={800}>{t(`crops.${crop.name}`)}</Typography>
                                                    <TextField
                                                        size="small"
                                                        variant="standard"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        autoFocus
                                                        sx={{ width: 80, '& input': { fontWeight: 800, textAlign: 'center' } }}
                                                        InputProps={{
                                                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                                            disableUnderline: true
                                                        }}
                                                    />
                                                    <IconButton size="small" color="primary" onClick={() => saveEdit(crop.id)}>
                                                        <Save fontSize="small" />
                                                    </IconButton>
                                                    <IconButton size="small" onClick={cancelEdit}>
                                                        <Close fontSize="small" />
                                                    </IconButton>
                                                </Paper>
                                            ) : (
                                                <Chip
                                                    icon={<LocalOffer sx={{ fontSize: '16px !important' }} />}
                                                    label={
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            <Typography variant="body2" fontWeight={700}>{t(`crops.${crop.name}`)}</Typography>
                                                            <Typography variant="body2" fontWeight={800} color="primary.main">₹{crop.price}/qtl</Typography>
                                                        </Box>
                                                    }
                                                    variant="outlined"
                                                    onDelete={() => setDeleteTarget(crop)}
                                                    deleteIcon={
                                                        <Box display="flex">
                                                            <Edit
                                                                sx={{
                                                                    fontSize: 18, mr: 0.5, cursor: 'pointer', color: 'text.secondary',
                                                                    '&:hover': { color: 'primary.main' }
                                                                }}
                                                                onClick={(e) => { e.stopPropagation(); startEdit(crop); }}
                                                            />
                                                            <Delete sx={{ fontSize: 18, cursor: 'pointer' }} />
                                                        </Box>
                                                    }
                                                    sx={{
                                                        height: 48, borderRadius: 10, px: 1,
                                                        borderColor: 'rgba(46,125,50,0.3)',
                                                        '& .MuiChip-label': { display: 'block' },
                                                        '&:hover': { bgcolor: 'success.50' }
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}

            {/* Add Crop Dialog */}
            <Dialog open={addOpen} onClose={() => setAddOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle fontWeight={800}>{t('mandi.addNewCrop')}</DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={3} pt={1}>
                        <TextField
                            select
                            fullWidth
                            label={t('mandi.cropName')}
                            value={newCrop.name}
                            onChange={(e) => setNewCrop({ ...newCrop, name: e.target.value })}
                        >
                            {ALL_CROPS.filter(c => !crops.find(existing => existing.id === c)).map((c) => (
                                <MenuItem key={c} value={c}>{t(`crops.${c}`)}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            fullWidth
                            type="number"
                            label={t('mandi.pricePerQuintal')}
                            value={newCrop.price}
                            onChange={(e) => setNewCrop({ ...newCrop, price: e.target.value })}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                endAdornment: <InputAdornment position="end">/qtl</InputAdornment>
                            }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setAddOpen(false)} color="inherit">{t('common.cancel')}</Button>
                    <Button
                        onClick={handleAdd}
                        variant="contained"
                        disabled={!newCrop.name || !newCrop.price}
                    >
                        {t('common.add')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
                <DialogTitle fontWeight={800}>{t('common.confirmDelete')}</DialogTitle>
                <DialogContent>
                    <Typography>
                        {t('mandi.deleteConfirm', { crop: deleteTarget ? t(`crops.${deleteTarget.name}`) : '' })}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setDeleteTarget(null)} color="inherit">{t('common.cancel')}</Button>
                    <Button onClick={handleDelete} variant="contained" color="error">{t('common.delete')}</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snack.open}
                autoHideDuration={4000}
                onClose={() => setSnack({ ...snack, open: false })}
                message={snack.msg}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />
        </Container>
    );
};

export default MandiOverviewPage;
