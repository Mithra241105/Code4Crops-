import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Card, CardContent, Chip, CircularProgress, Alert, Divider, Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Snackbar } from '@mui/material';
import { LocalShipping, Groups, CalendarMonth, LocationOn, Edit, Delete, Agriculture } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useUnit } from '../../contexts/UnitContext';
import api from '../../services/api';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';

const TravelPlansPage = () => {
    const { t } = useTranslation();
    const { fmtQty } = useUnit();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editTarget, setEditTarget] = useState(null);
    const [snack, setSnack] = useState('');
    const [updating, setUpdating] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [viewingPartners, setViewingPartners] = useState(null);

    const VEHICLES = [
        { value: 'bike', label: 'vehicles.bike' },
        { value: 'auto', label: 'vehicles.auto' },
        { value: 'miniTruck', label: 'vehicles.miniTruck' },
        { value: 'largeTruck', label: 'vehicles.largeTruck' },
        { value: 'tractor', label: 'vehicles.tractor' },
    ];

    const fetchPlans = async () => {
        try {
            const { data } = await api.get('/farmer/travel-plans');
            setPlans(data.plans);
        } catch (err) {
            setError('Failed to fetch travel plans');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const handleDelete = async () => {
        if (!deleteId) return;
        setError('');
        try {
            await api.delete(`/farmer/trips/${deleteId}`);
            setPlans(prev => prev.filter(p => p._id !== deleteId));
            setSnack(t('farmer.tripCancelled'));
        } catch (err) {
            console.error('Delete error:', err);
            setError(err.response?.data?.error || t('common.error'));
        } finally {
            setDeleteId(null);
        }
    };

    const handleUpdate = async () => {
        if (!editTarget) return;
        setUpdating(true);
        setError('');
        try {
            const { data } = await api.put(`/farmer/trips/${editTarget._id}`, {
                travelDate: editTarget.travelDate,
                vehicleType: editTarget.vehicleType,
                quantity: editTarget.quantity
            });
            if (data.plan) {
                setPlans(prev => prev.map(p => p._id === data.plan._id ? { ...p, ...data.plan } : p));
                setEditTarget(null);
                setSnack(t('farmer.tripUpdated'));
            }
        } catch (err) {
            console.error('Update error:', err);
            setError(err.response?.data?.error || t('common.error'));
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>;

    return (
        <Container maxWidth="md" sx={{ py: 4, pb: 10 }}>
            <Box mb={4}>
                <Typography variant="h4" fontWeight={900} color="primary" gutterBottom>
                    {t('farmer.bookedTrips')}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {t('farmer.bookedTripsSubtitle')}
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {plans.length === 0 ? (
                <Card sx={{ textAlign: 'center', py: 8, borderRadius: 4, bgcolor: 'action.hover', border: '2px dashed', borderColor: 'divider' }}>
                    <CardContent>
                        <LocalShipping sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" fontWeight={700}>
                            {t('farmer.noTrips')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            {t('farmer.startOptimizing')}
                        </Typography>
                    </CardContent>
                </Card>
            ) : (
                <Stack spacing={3}>
                    {plans.map((plan) => (
                        <Card key={plan._id} sx={{
                            borderRadius: 4,
                            overflow: 'hidden',
                            boxShadow: 'shadows.2',
                            border: '1px solid',
                            borderColor: 'divider'
                        }}>
                            <Box sx={{ bgcolor: 'primary.main', py: 1, px: 3 }}>
                                <Typography variant="caption" sx={{ color: 'white', fontWeight: 800, textTransform: 'uppercase' }}>
                                    {t('farmer.plannedTrip')}
                                </Typography>
                            </Box>
                            <CardContent sx={{ p: 3 }}>
                                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                    <Box>
                                        <Typography variant="body1" fontWeight={700} sx={{ mb: 1 }}>
                                            {plan.mandiId?.name || t('common.unknownMandi')}
                                        </Typography>
                                        <Box display="flex" flexWrap="wrap" gap={1}>
                                            <Chip
                                                icon={<LocationOn sx={{ fontSize: '14px !important' }} />}
                                                label={plan.mandiId?.location?.city || plan.mandiId?.name || t('common.location')}
                                            />
                                        </Box>
                                    </Box>
                                    <Box display="flex" gap={1}>
                                        <Chip
                                            label={t(`crops.${plan.crop}`)}
                                            sx={{ fontWeight: 700, borderRadius: 2, bgcolor: 'action.hover' }}
                                        />
                                        <Chip
                                            label={fmtQty(plan.quantity)}
                                            color="success"
                                            sx={{ fontWeight: 800, borderRadius: 2 }}
                                        />
                                    </Box>
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(160px, 1fr))" gap={3} mb={3}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Agriculture color="action" />
                                        <Box>
                                            <Typography variant="caption" display="block" color="text.secondary" fontWeight={700}>{t('farmer.partnerCrop')}</Typography>
                                            <Typography variant="body2" fontWeight={800}>{t(`crops.${plan.crop}`)}</Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <CalendarMonth color="action" />
                                        <Box>
                                            <Typography variant="caption" display="block" color="text.secondary" fontWeight={700}>{t('farmer.travelDate')}</Typography>
                                            <Typography variant="body2" fontWeight={800}>{plan.travelDate}</Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <LocalShipping color="action" />
                                        <Box>
                                            <Typography variant="caption" display="block" color="text.secondary" fontWeight={700}>{t('farmer.vehicleType')}</Typography>
                                            <Typography variant="body2" fontWeight={800} sx={{ textTransform: 'capitalize' }}>{t(`vehicles.${plan.vehicleType}`)}</Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Pooling Section */}
                                <Box sx={{
                                    bgcolor: plan.poolingCount > 0 ? 'success.main' : 'action.hover',
                                    opacity: plan.poolingCount > 0 ? 0.9 : 1,
                                    p: 2,
                                    borderRadius: 3,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    color: plan.poolingCount > 0 ? 'success.contrastText' : 'text.primary'
                                }}>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box sx={{
                                            width: 40, height: 40, borderRadius: 2,
                                            bgcolor: plan.poolingCount > 0 ? 'rgba(255,255,255,0.2)' : 'action.selected',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: plan.poolingCount > 0 ? 'white' : 'text.secondary'
                                        }}>
                                            <Groups />
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" fontWeight={800} color="inherit">
                                                {plan.poolingCount > 0
                                                    ? t('farmer.activePartners', { count: plan.poolingCount })
                                                    : t('farmer.noPartners')}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {plan.poolingCount > 0
                                                    ? t('farmer.contactPartners')
                                                    : t('farmer.waitPartners')}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    {plan.poolingCount > 0 && (
                                        <Button
                                            variant="contained"
                                            size="small"
                                            color="success"
                                            sx={{ borderRadius: 2, fontWeight: 700 }}
                                            onClick={() => setViewingPartners(plan.poolingPartners)}
                                        >
                                            {t('pool.viewDetails')}
                                        </Button>
                                    )}
                                </Box>

                                <Box mt={3} display="flex" gap={2}>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        sx={{ borderRadius: 2 }}
                                        startIcon={<Edit />}
                                        onClick={() => setEditTarget(plan)}
                                    >
                                        {t('common.edit')}
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        fullWidth
                                        sx={{ borderRadius: 2 }}
                                        startIcon={<Delete />}
                                        onClick={() => setDeleteId(plan._id)}
                                    >
                                        {t('common.cancel')}
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
            )}

            {/* Edit Modal */}
            <Dialog open={Boolean(editTarget)} onClose={() => setEditTarget(null)} maxWidth="xs" fullWidth>
                <DialogTitle fontWeight={800}>{t('farmer.editTrip')}</DialogTitle>
                <DialogContent>
                    <Box pt={1} display="flex" flexDirection="column" gap={2.5}>
                        <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">{t('farmer.partnerCrop')}</Typography>
                            <Typography variant="body1" fontWeight={800}>{t(`crops.${editTarget?.crop}`)}</Typography>
                        </Box>
                        <TextField
                            label={t('farmer.travelDate')}
                            type="date"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={editTarget?.travelDate || ''}
                            onChange={(e) => setEditTarget({ ...editTarget, travelDate: e.target.value })}
                        />
                        <TextField
                            select
                            label={t('farmer.vehicleType')}
                            fullWidth
                            value={editTarget?.vehicleType || ''}
                            onChange={(e) => setEditTarget({ ...editTarget, vehicleType: e.target.value })}
                        >
                            {VEHICLES.map(v => <MenuItem key={v.value} value={v.value}>{t(v.label)}</MenuItem>)}
                        </TextField>
                        <TextField
                            label={t('farmer.quantity')}
                            type="number"
                            fullWidth
                            value={editTarget?.quantity || ''}
                            onChange={(e) => setEditTarget({ ...editTarget, quantity: e.target.value })}
                            inputProps={{ min: 1 }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, pt: 0 }}>
                    <Button onClick={() => setEditTarget(null)} color="inherit" fontWeight={700}>
                        {t('common.cancel')}
                    </Button>
                    <Button
                        onClick={handleUpdate}
                        variant="contained"
                        disabled={updating}
                        sx={{ borderRadius: 2, fontWeight: 700 }}
                    >
                        {updating ? <CircularProgress size={20} color="inherit" /> : t('common.save')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Pooling Partners Detail Modal */}
            <Dialog open={Boolean(viewingPartners)} onClose={() => setViewingPartners(null)} maxWidth="xs" fullWidth>
                <DialogTitle fontWeight={800}>
                    {t('farmer.poolingPartners')}
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        {viewingPartners && viewingPartners.length > 0 ? viewingPartners.map((partner, i) => (
                            <Box key={i} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: 'action.hover' }}>
                                <Typography variant="subtitle1" fontWeight={800} color="primary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {partner.name}
                                </Typography>

                                <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1.5} mb={2}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">{t('farmer.partnerFrom')}</Typography>
                                        <Typography variant="body2" fontWeight={800} display="flex" alignItems="center" gap={0.5}>
                                            <LocationOn sx={{ fontSize: 14 }} /> {partner.from}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">{t('farmer.partnerTo')}</Typography>
                                        <Typography variant="body2" fontWeight={800} display="flex" alignItems="center" gap={0.5}>
                                            <LocationOn sx={{ fontSize: 14 }} /> {partner.to}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">{t('farmer.partnerCrop')}</Typography>
                                        <Typography variant="body2" fontWeight={800} display="flex" alignItems="center" gap={0.5}>
                                            <Agriculture sx={{ fontSize: 14 }} /> {t(`crops.${partner.crop}`)}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">{t('farmer.partnerLoad')}</Typography>
                                        <Typography variant="body2" fontWeight={800}>{fmtQty(partner.quantity)}</Typography>
                                    </Box>
                                </Box>

                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Chip
                                        icon={<LocalShipping sx={{ fontSize: '14px !important' }} />}
                                        label={t(`vehicles.${partner.vehicleType}`)}
                                        size="small"
                                        sx={{ fontWeight: 700, bgcolor: 'primary.light', color: 'primary.contrastText' }}
                                    />
                                    <Typography variant="body1" fontWeight={900} sx={{ color: 'success.main', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        {t('farmer.partnerPhone')}: {partner.phone}
                                    </Typography>
                                </Box>
                            </Box>
                        )) : (
                            <Typography align="center" color="text.secondary">{t('farmer.noResults')}</Typography>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button onClick={() => setViewingPartners(null)} variant="contained" fullWidth sx={{ borderRadius: 2, fontWeight: 800 }}>
                        {t('common.close')}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={Boolean(snack)}
                autoHideDuration={4000}
                onClose={() => setSnack('')}
                message={snack}
            />

            <ConfirmationDialog
                open={Boolean(deleteId)}
                title={t('common.confirm')}
                message={t('common.confirmDelete')}
                onConfirm={handleDelete}
                onCancel={() => setDeleteId(null)}
                confirmText={t('common.delete')}
                severity="error"
            />
        </Container >
    );
};

export default TravelPlansPage;
