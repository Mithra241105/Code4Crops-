import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, Box, Typography, Card, CardContent, TextField, Button,
    Alert, CircularProgress, Chip, Switch, FormControlLabel,
    Dialog, DialogTitle, DialogContent, DialogActions,
    IconButton, MenuItem, Tooltip, Snackbar,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    InputAdornment, Divider
} from '@mui/material';
import { Add, Edit, Delete, Agriculture, Save, Check, LocalOffer, Update, WarningAmber, CheckCircle, BarChart } from '@mui/icons-material';
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
        if (price) {
            cropPrices[crop] = Number(price);
            if (available) supportedCrops.push(crop);
        }
    });
    const { data } = await api.put('/mandi/admin/prices', {
        cropPrices,
        supportedCrops,
        handlingRate: Number(handlingRate),
    });
    return data;
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
                        select label={t('mandi.crop')} value={form.crop}
                        onChange={e => setForm(f => ({ ...f, crop: e.target.value }))}
                        fullWidth required disabled={isEdit}>
                        {availableCrops.map(c => (
                            <MenuItem key={c} value={c}>{t(`crops.${c}`)}</MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label={t('mandi.priceQtl')} type="number"
                        value={form.price}
                        onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                        fullWidth required inputProps={{ min: 1, step: 10 }}
                        helperText={t('unit.hint')}
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
        <DialogTitle sx={{ fontWeight: 800 }}>{t('mandi.removeCrop')}</DialogTitle>
        <DialogContent>
            <Typography>
                {t('mandi.deleteConfirm', { crop: cropName })}
                <br />
                {t('mandi.removeCropNote')}
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

// ── Bulk update confirm dialog ───────────────────────────────────────────
const BulkConfirmDialog = ({ open, onConfirm, onClose, t, pendingCount }) => (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningAmber color="warning" /> {t('mandi.confirmUpdate')}
        </DialogTitle>
        <DialogContent>
            <Typography>
                {t('mandi.confirmUpdateDesc', { count: pendingCount })}
            </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={onClose} variant="outlined" color="inherit">{t('common.cancel')}</Button>
            <Button onClick={onConfirm} variant="contained" color="primary" startIcon={<Save />}>
                {t('mandi.updateAll')}
            </Button>
        </DialogActions>
    </Dialog>
);

// ── Main page ─────────────────────────────────────────────────────────────
const MandiPricesPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [cropList, setCropList] = useState([]);
    const [handlingRate, setHandlingRate] = useState(150);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });
    const [snack, setSnack] = useState('');
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isOpen, setIsOpen] = useState(true);
    const [profile, setProfile] = useState(null);
    const [originalPrices, setOriginalPrices] = useState({});

    // Dialog state
    const [addOpen, setAddOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [confirmBulkOpen, setConfirmBulkOpen] = useState(false);

    // ── Load from API ──────────────────────────────────────────────
    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await api.get('/mandi/admin/profile');
                if (data.mandi) {
                    const priceMap = data.mandi.cropPrices || {};
                    const supported = data.mandi.supportedCrops || [];
                    const cropNames = new Set([...supported, ...Object.keys(priceMap)]);
                    const list = [...cropNames].map(crop => ({
                        crop,
                        price: priceMap[crop] ?? '',
                        available: supported.includes(crop),
                    }));
                    setCropList(list);
                    setHandlingRate(data.mandi.handlingRate || 150);
                    setLastUpdated(data.mandi.updatedAt);
                    setIsOpen(data.mandi.isOpen ?? true);
                    setProfile(data.mandi);

                    // Track original prices for delta highlighting
                    const originals = {};
                    list.forEach(c => originals[c.crop] = c.price);
                    setOriginalPrices(originals);
                }
            } catch {
                setAlertMsg({ type: 'error', text: 'Could not load mandi data. Complete your profile first.' });
            } finally { setLoading(false); }
        };
        fetchData();
    }, []);

    // ── Add ────────────────────────────────────────────────────────
    const handleAdd = async (form) => {
        const newList = [...cropList, { crop: form.crop, price: form.price, available: form.available }];
        setCropList(newList);
        setAddOpen(false);
        setSnack(t('mandi.stagedAdd'));
    };

    // ── Edit ───────────────────────────────────────────────────────
    const handleEdit = async (form) => {
        const newList = cropList.map(c => c.crop === form.crop ? { ...c, ...form } : c);
        setCropList(newList);
        setEditTarget(null);
        setSnack(t('mandi.stagedEdit'));
    };

    // ── Delete ─────────────────────────────────────────────────────
    const handleDelete = async () => {
        const target = deleteTarget;
        const newList = cropList.filter(c => c.crop !== target);
        setCropList(newList);
        setDeleteTarget(null);
        setSnack(t('mandi.stagedDelete'));
    };

    // ── Toggle availability ────────────────────────────────────────
    const handleToggleAvailable = (crop) => {
        setCropList(prev => prev.map(c => c.crop === crop ? { ...c, available: !c.available } : c));
    };

    // ── Inline price change ────────────────────────────────────────
    const handlePriceChange = (crop, val) => {
        setCropList(prev => prev.map(c => c.crop === crop ? { ...c, price: val } : c));
    };

    // ── Toggle Mandi Status (Open/Close) ──────────────────────────
    const handleToggleStatus = async () => {
        try {
            const newStatus = !isOpen;
            setIsOpen(newStatus); // Optimistic UI
            const { data } = await api.patch('/mandi/status', { isOpen: newStatus });
            setSnack(t('mandi.statusUpdated'));
            console.log('✅ Mandi Status Updated:', data);
        } catch (err) {
            setIsOpen(!isOpen); // Revert on error
            setAlertMsg({ type: 'error', text: err.response?.data?.error || t('common.error') });
        }
    };

    // ── Bulk save all (handling rate + all prices) ─────────────────
    const handleSaveAll = async () => {
        setConfirmBulkOpen(false);
        setSaving(true); setAlertMsg({ type: '', text: '' });
        try {
            const data = await persist(cropList, handlingRate);
            console.log('✅ Mandi Prices Update Success:', data);
            setAlertMsg({ type: 'success', text: t('mandi.priceUpdated') });
            if (data.mandi?.updatedAt) {
                setLastUpdated(data.mandi.updatedAt);
            }
            setSnack(t('mandi.priceUpdated'));

            // Update original prices after successful save
            const originals = {};
            cropList.forEach(c => originals[c.crop] = c.price);
            setOriginalPrices(originals);
        } catch (err) {
            console.error('❌ Mandi Prices Update Error:', err);
            setAlertMsg({ type: 'error', text: err.response?.data?.error || t('common.error') });
        } finally { setSaving(false); }
    };

    const existingCropNames = cropList.map(c => c.crop);

    // ── Computed Stats ─────────────────────────────────────────────
    const activeCropsCount = cropList.filter(c => c.available).length;
    const avgPrice = cropList.length > 0
        ? cropList.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0) / cropList.length
        : 0;

    const demandScore = profile?.demandScore || 0;

    const handleExportCSV = () => {
        const headers = ["Crop", "Price (₹/qtl)", "Available"];
        const rows = cropList.map(c => [t(`crops.${c.crop}`), c.price, c.available ? "Yes" : "No"]);
        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(r => r.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `mandi_prices_${new Date().toLocaleDateString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Premium Mandi Header */}
            <Card elevation={0} sx={{
                mb: 4, borderRadius: 3, overflow: 'hidden',
                background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
                boxShadow: '0 8px 32px rgba(46,125,50,0.2)',
                color: 'white', border: 'none'
            }}>
                <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                    <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={4} alignItems={{ md: 'center' }}>
                        <Box sx={{ flexGrow: 1 }}>
                            <Box display="flex" alignItems="center" gap={2} mb={1}>
                                <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.3px', opacity: 0.95 }}>
                                    {profile?.name || t('nav.mandiTitle')}
                                </Typography>
                                {profile?.verified && (
                                    <Chip
                                        label={t('mandi.verifiedMandi')}
                                        icon={<CheckCircle sx={{ color: 'white !important', fontSize: 16 }} />}
                                        sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 800, height: 24 }}
                                    />
                                )}
                            </Box>
                            <Box display="flex" alignItems="center" gap={1.5} opacity={0.8} mb={2}>
                                <Typography variant="body1" fontWeight={500}>
                                    📍 {profile?.location?.city || t('mandi.notAvailable')}, {profile?.location?.district || t('mandi.notAvailable')}, {profile?.location?.state || t('mandi.notAvailable')}
                                </Typography>
                                <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)', height: 16 }} />
                                <Typography variant="body1">📞 {profile?.phone || t('mandi.notAvailable')}</Typography>
                            </Box>
                            <Box display="flex" flexWrap="wrap" gap={2}>
                                <Box sx={{ bgcolor: 'rgba(255,255,255,0.15)', px: 2, py: 1, borderRadius: 2 }}>
                                    <Typography variant="caption" display="block" sx={{ opacity: 0.8, textTransform: 'uppercase', fontWeight: 700 }}>
                                        {t('mandi.demandScore')}
                                    </Typography>
                                    <Typography variant="h5" fontWeight={900}>
                                        {demandScore}%
                                    </Typography>
                                </Box>
                                <Box sx={{ bgcolor: 'rgba(255,255,255,0.15)', px: 2, py: 1, borderRadius: 2 }}>
                                    <Typography variant="caption" display="block" sx={{ opacity: 0.8, textTransform: 'uppercase', fontWeight: 700 }}>
                                        {t('mandi.totalCropsListed')}
                                    </Typography>
                                    <Typography variant="h5" fontWeight={900}>
                                        {cropList.length}
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    bgcolor: 'rgba(255,255,255,0.15)', px: 2, py: 1, borderRadius: 2,
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    transition: 'all 0.2s',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.25)', borderColor: 'rgba(255,255,255,0.3)' }
                                }}>
                                    <Typography variant="caption" display="block" sx={{ opacity: 0.8, textTransform: 'uppercase', fontWeight: 700 }}>
                                        {t('mandi.handlingRate')} (₹)
                                    </Typography>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <TextField
                                            variant="standard"
                                            value={handlingRate}
                                            onChange={(e) => setHandlingRate(e.target.value)}
                                            inputProps={{
                                                style: { color: 'white', fontWeight: 900, fontSize: '1.5rem', width: '80px', textAlign: 'center' }
                                            }}
                                            InputProps={{ disableUnderline: true }}
                                        />
                                    </Box>
                                </Box>
                            </Box>
                        </Box>

                        <Box sx={{ minWidth: 260, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{
                                bgcolor: 'rgba(255,255,255,0.1)',
                                px: 2, py: 1.5,
                                borderRadius: '50px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 2,
                                border: '1px solid rgba(255,255,255,0.15)',
                                cursor: 'pointer',
                                transition: 'background 0.3s ease',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' }
                            }} onClick={handleToggleStatus}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Box sx={{
                                        width: 9, height: 9, borderRadius: '50%',
                                        bgcolor: isOpen ? '#4ADE80' : '#F87171',
                                        boxShadow: `0 0 8px ${isOpen ? '#4ADE80' : '#F87171'}`,
                                        transition: 'all 0.3s ease',
                                        animation: isOpen ? 'pulse 2s infinite' : 'none',
                                        '@keyframes pulse': {
                                            '0%, 100%': { opacity: 1 },
                                            '50%': { opacity: 0.5 }
                                        }
                                    }} />
                                    <Typography variant="body2" fontWeight={700}>
                                        {isOpen ? t('mandi.openForTrade') : t('mandi.closedToday')}
                                    </Typography>
                                </Box>
                                {/* Custom iOS-style pill track */}
                                {/* Custom iOS-style pill track */}
                                <Box sx={{
                                    position: 'relative',
                                    width: 60, height: 32,
                                    borderRadius: '16px',
                                    bgcolor: isOpen ? '#4ADE80' : 'rgba(255,255,255,0.2)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    border: '2px solid rgba(255,255,255,0.3)',
                                    flexShrink: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    px: 0.8
                                }}>
                                    <Typography sx={{
                                        position: 'absolute',
                                        left: isOpen ? 8 : 'auto',
                                        right: isOpen ? 'auto' : 8,
                                        fontSize: '9px', fontWeight: 900, color: 'white',
                                        opacity: 0.8, pointerEvents: 'none'
                                    }}>
                                        {isOpen ? 'ON' : 'OFF'}
                                    </Typography>
                                    <Box sx={{
                                        position: 'absolute',
                                        top: 3, left: isOpen ? 'calc(100% - 27px)' : 3,
                                        width: 22, height: 22,
                                        borderRadius: '50%',
                                        bgcolor: 'white',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    }} />
                                </Box>
                            </Box>
                            <Button
                                fullWidth variant="outlined"
                                onClick={() => setAddOpen(true)}
                                startIcon={<Add />}
                                sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)', borderWidth: 2, py: 1.2, fontWeight: 700, borderRadius: 2 }}
                            >
                                {t('mandi.addCrop')}
                            </Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Performance Summary Strip */}
            <Box id="perf-strip" mb={4} display="grid" gridTemplateColumns={{ xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={2}>
                {[
                    { label: t('mandi.activeCrops'), value: activeCropsCount, icon: <Agriculture color="primary" /> },
                    { label: t('mandi.avgCropPrice'), value: `₹${avgPrice.toFixed(0)}`, icon: <LocalOffer color="success" /> },
                    { label: t('mandi.handlingRate'), value: `₹${handlingRate}`, icon: <Update color="info" /> },
                    { label: t('mandi.lastUpdated'), value: lastUpdated ? new Date(lastUpdated).toLocaleDateString() : '--', icon: <CheckCircle color="secondary" /> }
                ].map((stat, idx) => (
                    <Card key={idx} sx={{ borderRadius: 2 }}>
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{ bgcolor: 'action.hover', p: 1, borderRadius: 1.5, display: 'flex' }}>
                                    {stat.icon}
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
                                        {stat.label}
                                    </Typography>
                                    <Typography variant="h6" fontWeight={800}>{stat.value}</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </Box>

            {/* Insight Block */}
            <Card elevation={0} sx={{
                mb: 4, borderRadius: 2, border: '1px solid',
                borderColor: demandScore > 80 ? 'success.light' : demandScore > 60 ? 'info.light' : 'warning.light',
                bgcolor: demandScore > 80 ? 'success.lighter' : demandScore > 60 ? 'info.lighter' : 'warning.lighter'
            }}>
                <CardContent sx={{ py: 2, px: 3, '&:last-child': { pb: 2 } }}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <Box sx={{
                            width: 32, height: 32, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            bgcolor: demandScore > 80 ? 'success.main' : demandScore > 60 ? 'info.main' : 'warning.main',
                            color: 'white'
                        }}>
                            {demandScore > 80 ? '🔥' : demandScore > 60 ? '📈' : '⚠️'}
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" fontWeight={800} color="text.primary">
                                {t('mandi.marketPerformance')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {demandScore > 85 ? t('mandi.highDemandInsight') : demandScore >= 60 ? t('mandi.stableDemandInsight') : t('mandi.lowDemandInsight')}
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Quick Actions & Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
                <Typography variant="h5" fontWeight={800}>{t('mandi.updatePrices')}</Typography>
                <Box display="flex" gap={1.5}>
                    <Button
                        variant="outlined" size="small" startIcon={<BarChart />}
                        onClick={() => navigate('/mandi/analytics')}
                        sx={{ borderRadius: 10, fontWeight: 700 }}
                    >
                        {t('mandi.viewMarketStats')}
                    </Button>
                    <Button variant="outlined" size="small" startIcon={<Update />} sx={{ borderRadius: 10, fontWeight: 700 }}>
                        {t('mandi.refreshPrices')}
                    </Button>
                    <Button
                        variant="outlined" size="small" startIcon={<Save />}
                        onClick={handleExportCSV}
                        sx={{ borderRadius: 10, fontWeight: 700 }}
                    >
                        {t('mandi.exportCSV')}
                    </Button>
                </Box>
            </Box>

            {alertMsg.text && (
                <Alert severity={alertMsg.type} sx={{ mb: 3 }} onClose={() => setAlertMsg({ type: '', text: '' })}>
                    {alertMsg.text}
                </Alert>
            )}

            {/* Crop Table */}
            {cropList.length === 0 ? (
                <Card sx={{ textAlign: 'center', py: 8 }}>
                    <Agriculture sx={{ fontSize: 56, color: 'primary.light', mb: 2, opacity: 0.5 }} />
                    <Typography variant="h6" color="text.secondary">{t('mandi.noCrops')}</Typography>
                    <Typography variant="body2" color="text.secondary" mb={3}>
                        Add crops that your mandi accepts to appear in farmer search results.
                    </Typography>
                    <Button variant="contained" startIcon={<Add />} onClick={() => setAddOpen(true)} sx={{ mt: 1 }}>
                        {t('mandi.addCrop')}
                    </Button>
                </Card>
            ) : (
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 4 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 800 }}>{t('mandi.crop')}</TableCell>
                                <TableCell sx={{ fontWeight: 800 }}>{t('mandi.priceQtl')}</TableCell>
                                <TableCell sx={{ fontWeight: 800 }}>{t('mandi.priceKg')}</TableCell>
                                <TableCell sx={{ fontWeight: 800 }}>{t('mandi.lastUpdated')}</TableCell>
                                <TableCell sx={{ fontWeight: 800 }} align="center">{t('common.available')}</TableCell>
                                <TableCell sx={{ fontWeight: 800 }} align="right">{t('mandi.actions')}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {cropList.map(({ crop, price, available }, idx) => {
                                const original = originalPrices[crop];
                                const isChanged = original !== undefined && original !== price && price !== '';
                                const diff = isChanged ? Number(price) - Number(original) : 0;

                                return (
                                    <TableRow
                                        key={crop}
                                        hover
                                        sx={{
                                            '&:last-child td, &:last-child th': { border: 0 },
                                            bgcolor: idx % 2 === 0 ? 'transparent' : 'action.hover',
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        <TableCell sx={{ fontWeight: 600 }}>
                                            {t(`crops.${crop}`)}
                                        </TableCell>
                                        <TableCell sx={{ width: 180 }}>
                                            <Box display="flex" flexDirection="column">
                                                <TextField
                                                    size="small" type="number"
                                                    value={price}
                                                    onChange={e => handlePriceChange(crop, e.target.value)}
                                                    inputProps={{ min: 1, step: 10 }}
                                                    InputProps={{
                                                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                                    }}
                                                    variant="standard"
                                                    sx={{
                                                        '& .MuiInput-root': {
                                                            fontWeight: isChanged ? 800 : 500,
                                                            color: isChanged ? 'primary.main' : 'inherit'
                                                        }
                                                    }}
                                                />
                                                {isChanged && (
                                                    <Typography variant="caption" sx={{
                                                        color: diff > 0 ? 'success.main' : 'error.main',
                                                        fontWeight: 700, mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5
                                                    }}>
                                                        {diff > 0 ? '▲' : '▼'} ₹{Math.abs(diff)} {t('mandi.staged')}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                                {price ? `₹${(Number(price) / 100).toFixed(2)}` : '-'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {lastUpdated ? new Date(lastUpdated).toLocaleDateString() : '-'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Switch
                                                checked={available}
                                                onChange={() => handleToggleAvailable(crop)}
                                                color="success"
                                                size="medium"
                                                sx={{
                                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                                        transform: 'translateX(20px)',
                                                        '& + .MuiSwitch-track': { opacity: 1 }
                                                    }
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Box display="flex" justifyContent="flex-end" gap={0.5}>
                                                <Tooltip title={t('common.edit')}>
                                                    <IconButton size="small" onClick={() => setEditTarget({ crop, price, available })}>
                                                        <Edit fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={t('common.delete')}>
                                                    <IconButton size="small" onClick={() => setDeleteTarget(crop)} color="error">
                                                        <Delete fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Handling rate + Save All */}
            {cropList.length > 0 && (
                <Box display="flex" flexDirection="column" gap={3}>
                    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                        <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                            <Box flex={1} minWidth={200}>
                                <Typography variant="h6" fontWeight={700}>{t('mandi.handlingRate')}</Typography>
                                <Typography variant="body2" color="text.secondary">{t('mandi.handlingRateDesc')}</Typography>
                            </Box>
                            <TextField
                                type="number" value={handlingRate}
                                onChange={e => setHandlingRate(e.target.value)}
                                inputProps={{ min: 0, step: 10 }}
                                sx={{ width: 160 }} size="small" label={t('mandi.pricePerQuintal')}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                }}
                            />
                        </CardContent>
                    </Card>

                    <Box display="flex" justifyContent="flex-end" alignItems="center" gap={2}>
                        {alertMsg.type === 'success' && (
                            <Typography variant="body2" color="success.main" display="flex" alignItems="center" gap={0.5}>
                                <CheckCircle fontSize="small" /> {t('mandi.savedSuccessfully')}
                            </Typography>
                        )}
                        <Button variant="contained" size="large" onClick={() => setConfirmBulkOpen(true)} disabled={saving}
                            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save />}
                            sx={{ py: 1.5, px: 6, borderRadius: 2, fontWeight: 700 }}>
                            {t('mandi.saveAllChanges') || "Save All Changes"}
                        </Button>
                    </Box>
                </Box>
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
            <BulkConfirmDialog
                open={confirmBulkOpen}
                pendingCount={cropList.length}
                onConfirm={handleSaveAll}
                onClose={() => setConfirmBulkOpen(false)}
                t={t}
            />

            {/* Brief toast on auto-save */}
            <Snackbar
                open={!!snack} autoHideDuration={3000}
                onClose={() => setSnack('')}
                message={snack}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />
        </Container>
    );
};

export default MandiPricesPage;
