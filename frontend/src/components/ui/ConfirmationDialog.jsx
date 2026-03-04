import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Typography, Box } from '@mui/material';
import { WarningAmber } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const ConfirmationDialog = ({ open, title, message, onConfirm, onCancel, confirmText, cancelText, severity = 'warning' }) => {
    const { t } = useTranslation();

    return (
        <Dialog
            open={open}
            onClose={onCancel}
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    minWidth: 320
                }
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
                <WarningAmber sx={{ color: severity === 'warning' ? 'warning.main' : 'error.main' }} />
                <Typography variant="h6" fontWeight={700}>
                    {title || t('common.confirm')}
                </Typography>
            </DialogTitle>
            <DialogContent>
                <DialogContentText color="text.secondary">
                    {message}
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 1 }}>
                <Button onClick={onCancel} sx={{ fontWeight: 600 }}>
                    {cancelText || t('common.cancel')}
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    color={severity === 'error' ? 'error' : 'primary'}
                    sx={{ fontWeight: 700, px: 3, borderRadius: 2 }}
                    autoFocus
                >
                    {confirmText || t('common.confirm')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmationDialog;
