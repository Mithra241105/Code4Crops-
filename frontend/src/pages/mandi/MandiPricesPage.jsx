import React, { useState, useEffect, useCallback } from 'react';
import {
    Container, Box, Typography, Card, CardContent, TextField, Button,
    Alert, CircularProgress, Chip, Switch, FormControlLabel,
    Dialog, DialogTitle, DialogContent, DialogActions,
    IconButton, MenuItem, Tooltip, Snackbar
} from '@mui/material';
import { Add, Edit, Delete, Agriculture, Save, Check, LocalOffer } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';

const ALL_CROPS = [
    'wheat', 'rice', 'maize', 'onion', 'potato', 'tomato', 'cotton',
    'soybean', 'mustard', 'groundnut', 'garlic', 'chilli', 'banana',
    'orange', 'millet', 'ragi', 'castor', 'grapes', 'guar', 'bajra',
    'brinjal', 'jute', 'coconut',
];

// ── Helper: converts cropList → API payload and sends PUT ─────────────────
const persist = async (list, handlingRate) => {
    const cropPrices = {};
    const supportedCrops = [];
    list.forEach(({ crop, price, available }) => {
        if (available && price) {
            cropPrices[crop] = Number(price);
            supportedCrops.push(crop);
        }
    });
    await api.put('/mandi/admin/prices', {
        cropPrices,
        supportedCrops,
        handlingRate: Number(handlingRate),
    });
};

// ── Add / Edit dialog ─────────────────────────────────────────────────────
const CropDialog = ({ open, initial, existing, onSave, onClose, t }) => {
    const [form, setForm] = useState(initial || { crop: '', price: '', available: true });
    useEffect(() => setForm(initial || { crop: '', price: '', available: true }), [initial, open]);

    const isEdit = !!initial?.crop;
    const availableCrops = ALL_CROPS.filter(c => c === form.crop || !existing.includes(c));
    const valid = form.crop && form.price && Number(form.price) > 0;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
            PaperProps={{ sx: { borderRadius: 3, p: 0.5 } }}>
            <DialogTitle sx={{ fontWeight: 800, pb: 0 }}>
                {isEdit ? t('mandi.editCrop') : t('mandi.addCrop')}
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
                <Box display="flex" flexDirection="column" gap={2.5} mt={1}>
                    <TextField
                        select label="Crop" value={form.crop}
                        onChange={e => setForm(f => ({ ...f, crop: e.target.value }))}
                        fullWidth required disabled={isEdit}>
                        {availableCrops.map(c => (
                            <MenuItem key={c} value={c}>{t(`crops.${c}`)}</MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label="Price (₹ per quintal)" type="number"
                        value={form.price}
                        onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                        fullWidth required inputProps={{ min: 1, step: 10 }}
                        helperText="1 quintal = 100 kg"
                    />
                    <FormControlLabel
                        control={
                            <Switch checked={form.available} color="success"
                                onChange={e => setForm(f => ({ ...f, available: e.target.checked }))} />
                        }
                        label={form.available ? t('mandi.cropAvailability') : t('common.unavailable')}
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} variant="outlined" color="inherit">{t('common.cancel')}</Button>
                <Button onClick={() => valid && onSave(form)} variant="contained" disabled={!valid}>
                    {isEdit ? t('common.save') : t('common.add')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// ── Delete confirm dialog ─────────────────────────────────────────────────
const DeleteDialog = ({ open, cropName, onConfirm, onClose, t }) => (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Remove Crop</DialogTitle>
        <DialogContent>
            <Typography>
                Remove <strong>{cropName}</strong> from your mandi?
                Farmers will no longer see pricing for this crop.
            </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={onClose} variant="outlined" color="inherit">{t('common.cancel')}</Button>
            <Button onClick={onConfirm} variant="contained" color="error" startIcon={<Delete />}>
                {t('common.delete')}
            </Button>
        </DialogActions>
    </Dialog>
);

// ── Main page ─────────────────────────────────────────────────────────────
const MandiPricesPage = () => {
    const { t } = useTranslation();
    const [cropList, setCropList] = useState([]);
    const [handlingRate, setHandlingRate] = useState(150);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);    // bulk save
    const [opSaving, setOpSaving] = useState('');   // per-op progress key
    const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });
    const [snack, setSnack] = useState('');

    // Dialog state
    const [addOpen, setAddOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    // ── Load from API ──────────────────────────────────────────────
    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await api.get('/mandi/admin/profile');
                if (data.mandi) {
                    const priceMap = data.mandi.cropPrices || {};
                    const supported = data.mandi.supportedCrops || [];
                    // Build list: supported crops are 'available', rest from priceMap are 'unavailable'
                    const cropNames = new Set([...supported, ...Object.keys(priceMap)]);
                    const list = [...cropNames].map(crop => ({
                        crop,
                        price: priceMap[crop] ?? '',
                        available: supported.includes(crop),
                    }));
                    setCropList(list);
                    setHandlingRate(data.mandi.handlingRate || 150);
                }
            } catch {
                setAlertMsg({ type: 'error', text: 'Could not load mandi data. Complete your profile first.' });
            } finally { setLoading(false); }
        };
        fetchData();
    }, []);

    // ── Generic persist after mutation ─────────────────────────────
    const persistList = useCallback(async (list, rate = handlingRate, opKey = '') => {
        if (opKey) setOpSaving(opKey);
        try {
            await persist(list, rate);
            setSnack('Saved ✓');
        } catch (err) {
            setAlertMsg({ type: 'error', text: err.response?.data?.error || 'Failed to save. Complete your profile first.' });
        } finally {
            if (opKey) setOpSaving('');
        }
    }, [handlingRate]);

    // ── Add ────────────────────────────────────────────────────────
    const handleAdd = async (form) => {
        const newList = [...cropList, { crop: form.crop, price: form.price, available: form.available }];
        setCropList(newList);
        setAddOpen(false);
        await persistList(newList, handlingRate, 'add');
    };

    // ── Edit ───────────────────────────────────────────────────────
    const handleEdit = async (form) => {
        const newList = cropList.map(c => c.crop === form.crop ? { ...c, ...form } : c);
        setCropList(newList);
        setEditTarget(null);
        await persistList(newList, handlingRate, 'edit');
    };

    // ── Delete ─────────────────────────────────────────────────────
    const handleDelete = async () => {
        const target = deleteTarget;
        const newList = cropList.filter(c => c.crop !== target);
        setCropList(newList);
        setDeleteTarget(null);
        await persistList(newList, handlingRate, 'delete');
    };

    // ── Toggle availability ────────────────────────────────────────
    const handleToggleAvailable = async (crop) => {
        const newList = cropList.map(c => c.crop === crop ? { ...c, available: !c.available } : c);
        setCropList(newList);
        await persistList(newList, handlingRate, `toggle-${crop}`);
    };

    // ── Inline price change ────────────────────────────────────────
    const handlePriceChange = (crop, val) => {
        setCropList(prev => prev.map(c => c.crop === crop ? { ...c, price: val } : c));
    };

    // ── Bulk save all (handling rate + all prices) ─────────────────
    const handleSaveAll = async () => {
        setSaving(true); setAlertMsg({ type: '', text: '' });
        try {
            await persist(cropList, handlingRate);
            setAlertMsg({ type: 'success', text: 'All changes saved successfully.' });
        } catch (err) {
            setAlertMsg({ type: 'error', text: err.response?.data?.error || 'Failed to save. Complete your profile first.' });
        } finally { setSaving(false); }
    };

    const existingCropNames = cropList.map(c => c.crop);

    if (loading) return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Page header */}
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2} mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight={800}>{t('mandi.updatePrices')}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Set today's prices. Changes auto-save. Farmers see them in real-time.
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<Add />} onClick={() => setAddOpen(true)}
                    sx={{ borderRadius: 2, px: 3 }}>
                    {t('mandi.addCrop')}
                </Button>
            </Box>

            {alertMsg.text && (
                <Alert severity={alertMsg.type} sx={{ mb: 3 }} onClose={() => setAlertMsg({ type: '', text: '' })}>
                    {alertMsg.text}
                </Alert>
            )}

            {/* Crop cards */}
            {cropList.length === 0 ? (
                <Card sx={{ textAlign: 'center', py: 8 }}>
                    <Agriculture sx={{ fontSize: 56, color: '#C8E6C9', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">{t('mandi.noCrops')}</Typography>
                    <Typography variant="body2" color="text.secondary" mb={3}>
                        Add crops that your mandi accepts to appear in farmer search results.
                    </Typography>
                    <Button variant="contained" startIcon={<Add />} onClick={() => setAddOpen(true)} sx={{ mt: 1 }}>
                        {t('mandi.addCrop')}
                    </Button>
                </Card>
            ) : (
                <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' }} gap={2} mb={3}>
                    {cropList.map(({ crop, price, available }) => {
                        const isSavingThis = opSaving === `toggle-${crop}`;
                        return (
                            <Card key={crop} elevation={0} sx={{
                                border: `1.5px solid ${available ? 'rgba(46,125,50,0.3)' : 'rgba(0,0,0,0.1)'}`,
                                borderRadius: 2,
                                opacity: available ? 1 : 0.6,
                                transition: 'all 0.15s ease',
                                position: 'relative',
                            }}>
                                {/* Available indicator */}
                                {available && (
                                    <Box sx={{
                                        position: 'absolute', top: 10, left: 10,
                                        width: 8, height: 8, borderRadius: '50%',
                                        bgcolor: '#43A047',
                                        boxShadow: '0 0 0 2px rgba(67,160,71,0.25)',
                                    }} />
                                )}
                                <CardContent sx={{ p: 2 }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                                        <Typography variant="body1" fontWeight={700} ml={1.5}>
                                            {t(`crops.${crop}`)}
                                        </Typography>
                                        <Box display="flex" gap={0.5}>
                                            <Tooltip title={t('common.edit')}>
                                                <IconButton size="small" onClick={() => setEditTarget({ crop, price, available })}>
                                                    <Edit sx={{ fontSize: 16 }} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={t('common.delete')}>
                                                <IconButton size="small" onClick={() => setDeleteTarget(crop)} color="error">
                                                    {opSaving === 'delete' && deleteTarget === crop
                                                        ? <CircularProgress size={14} />
                                                        : <Delete sx={{ fontSize: 16 }} />}
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Box>
                                    <TextField
                                        size="small" fullWidth type="number"
                                        value={price}
                                        onChange={e => handlePriceChange(crop, e.target.value)}
                                        label="₹ per quintal"
                                        inputProps={{ min: 1, step: 10 }}
                                        sx={{ mb: 1.5 }}
                                    />
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <FormControlLabel
                                            control={
                                                isSavingThis
                                                    ? <CircularProgress size={20} sx={{ mx: 1 }} />
                                                    : <Switch size="small" checked={available}
                                                        onChange={() => handleToggleAvailable(crop)} color="success" />
                                            }
                                            label={
                                                <Typography variant="caption" fontWeight={600}>
                                                    {available ? t('common.available') : t('common.unavailable')}
                                                </Typography>
                                            }
                                            sx={{ m: 0 }}
                                        />
                                        {available && price && (
                                            <Typography variant="caption" color="text.secondary">
                                                ₹{(Number(price) / 100).toFixed(0)}/kg
                                            </Typography>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        );
                    })}
                </Box>
            )}

            {/* Handling rate + Save All */}
            {cropList.length > 0 && (
                <>
                    <Card elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.08)', mb: 3 }}>
                        <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                            <Box flex={1} minWidth={200}>
                                <Typography variant="h6" fontWeight={700}>{t('mandi.handlingRate')}</Typography>
                                <Typography variant="body2" color="text.secondary">{t('mandi.handlingRateDesc')}</Typography>
                            </Box>
                            <TextField
                                type="number" value={handlingRate}
                                onChange={e => setHandlingRate(e.target.value)}
                                inputProps={{ min: 0, step: 10 }}
                                sx={{ width: 160 }} size="small" label="₹ per quintal"
                            />
                        </CardContent>
                    </Card>

                    <Button variant="contained" size="large" onClick={handleSaveAll} disabled={saving}
                        startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save />}
                        sx={{ py: 1.5, px: 4 }}>
                        {t('mandi.savePrices')}
                    </Button>
                </>
            )}

            {/* Dialogs */}
            <CropDialog
                open={addOpen} initial={null} existing={existingCropNames}
                onSave={handleAdd} onClose={() => setAddOpen(false)} t={t}
            />
            <CropDialog
                open={!!editTarget} initial={editTarget} existing={existingCropNames}
                onSave={handleEdit} onClose={() => setEditTarget(null)} t={t}
            />
            <DeleteDialog
                open={!!deleteTarget}
                cropName={deleteTarget ? t(`crops.${deleteTarget}`) : ''}
                onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} t={t}
            />

            {/* Brief toast on auto-save */}
            <Snackbar
                open={!!snack} autoHideDuration={2000}
                onClose={() => setSnack('')}
                message={snack}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />
        </Container>
    );
};

export default MandiPricesPage;
