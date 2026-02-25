import React, { useState } from 'react';
import {
    AppBar, Toolbar, Typography, Box, Avatar, Chip,
    IconButton, Menu, MenuItem, ListItemIcon, ListItemText,
    Divider, useMediaQuery, useTheme, SwipeableDrawer, List, ListItem, ListItemButton
} from '@mui/material';
import {
    Logout, Person, Lock, Home, GridView, Translate,
    ChevronRight, Close
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LanguageSwitcher from '../ui/LanguageSwitcher';

const Navbar = ({ title, role }) => {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
    const handleCloseMenu = () => setAnchorEl(null);

    const handleNavigate = (path, state) => {
        navigate(path, { state });
        handleCloseMenu();
    };

    const handleLogout = () => {
        logout();
        navigate('/auth/login');
        handleCloseMenu();
    };

    const menuItems = [
        { label: t('Dashboard'), icon: <GridView fontSize="small" />, action: () => handleNavigate(role === 'mandi' ? '/mandi' : '/') },
        { label: t('profile.accountInfo'), icon: <Person fontSize="small" />, action: () => handleNavigate(`/${role}/profile`, { tab: 0 }) },
        { label: t('profile.security'), icon: <Lock fontSize="small" />, action: () => handleNavigate(`/${role}/profile`, { tab: 1 }) },
    ];

    return (
        <AppBar position="sticky" elevation={0} sx={{
            background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            zIndex: theme.zIndex.drawer + 1
        }}>
            <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, gap: 2 }}>
                {/* Logo */}
                <Box display="flex" alignItems="center" gap={1} sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => navigate(role === 'mandi' ? '/mandi' : '/')}>
                    <Box sx={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <span style={{ fontSize: 20 }}>🌾</span>
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight={800} lineHeight={1}>{t('app.name')}</Typography>
                        {role && (
                            <Chip label={role === 'farmer' ? t('auth.farmer') : t('auth.mandi')}
                                size="small" sx={{ height: 18, fontSize: '0.65rem', bgcolor: 'rgba(255,255,255,0.2)', color: 'white', mt: 0.2 }} />
                        )}
                    </Box>
                </Box>

                {/* desktop menu elements */}
                {!isMobile && (
                    <Box display="flex" alignItems="center" gap={2}>
                        <LanguageSwitcher />
                    </Box>
                )}

                {/* User avatar for menu */}
                {user && (
                    <Box>
                        <IconButton onClick={handleOpenMenu} sx={{ p: 0.5, border: '2px solid rgba(255,255,255,0.2)' }}>
                            <Avatar sx={{
                                width: 32, height: 32,
                                bgcolor: 'white', color: 'primary.main',
                                fontSize: '0.875rem', fontWeight: 800
                            }}>
                                {user.name?.[0]?.toUpperCase()}
                            </Avatar>
                        </IconButton>

                        {/* DESKTOP DROPDOWN */}
                        {!isMobile ? (
                            <Menu
                                anchorEl={anchorEl}
                                open={open}
                                onClose={handleCloseMenu}
                                onClick={handleCloseMenu}
                                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                PaperProps={{
                                    elevation: 4,
                                    sx: {
                                        mt: 1.5, minWidth: 220, borderRadius: 2,
                                        overflow: 'visible',
                                        '&:before': {
                                            content: '""', display: 'block', position: 'absolute',
                                            top: 0, right: 14, width: 10, height: 10,
                                            bgcolor: 'background.paper', transform: 'translateY(-50%) rotate(45deg)',
                                            zIndex: 0,
                                        },
                                    },
                                }}
                            >
                                <Box sx={{ px: 2, py: 1.5 }}>
                                    <Typography variant="subtitle2" fontWeight={800}>{user.name}</Typography>
                                    <Typography variant="caption" color="text.secondary" display="block">{user.email}</Typography>
                                </Box>
                                <Divider />
                                {menuItems.map((item, idx) => (
                                    <MenuItem key={idx} onClick={item.action} sx={{ py: 1.2 }}>
                                        <ListItemIcon sx={{ color: 'primary.main' }}>{item.icon}</ListItemIcon>
                                        <ListItemText primary={item.label} primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }} />
                                    </MenuItem>
                                ))}
                                <Divider />
                                <MenuItem onClick={handleLogout} sx={{ py: 1.2, color: 'error.main' }}>
                                    <ListItemIcon sx={{ color: 'error.main' }}><Logout fontSize="small" /></ListItemIcon>
                                    <ListItemText primary={t('auth.logout')} primaryTypographyProps={{ variant: 'body2', fontWeight: 700 }} />
                                </MenuItem>
                            </Menu>
                        ) : (
                            /* MOBILE BOTTOM SHEET / DRAWER */
                            <SwipeableDrawer
                                anchor="bottom"
                                open={open}
                                onClose={handleCloseMenu}
                                onOpen={handleOpenMenu}
                                PaperProps={{
                                    sx: { borderTopLeftRadius: 20, borderTopRightRadius: 20, pb: 2 }
                                }}
                            >
                                <Box sx={{ w: 40, h: 4, bgcolor: 'divider', borderRadius: 2, mx: 'auto', mt: 1.5, mb: 1, width: 40, height: 4 }} />
                                <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main', fontWeight: 800 }}>
                                        {user.name?.[0]?.toUpperCase()}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={800}>{user.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                                    </Box>
                                </Box>
                                <Divider />
                                <List sx={{ px: 1 }}>
                                    {menuItems.map((item, idx) => (
                                        <ListItem key={idx} disablePadding>
                                            <ListItemButton onClick={item.action} sx={{ borderRadius: 2, py: 1.5 }}>
                                                <ListItemIcon sx={{ color: 'primary.main', minWidth: 40 }}>{item.icon}</ListItemIcon>
                                                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600 }} />
                                                <ChevronRight fontSize="small" sx={{ color: 'text.disabled' }} />
                                            </ListItemButton>
                                        </ListItem>
                                    ))}
                                    <ListItem disablePadding>
                                        <Box sx={{ px: 2, py: 1, width: '100%' }}>
                                            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                                {t('unit.title')} / {t('common.language')}
                                            </Typography>
                                            <LanguageSwitcher />
                                        </Box>
                                    </ListItem>
                                    <Divider sx={{ my: 1 }} />
                                    <ListItem disablePadding>
                                        <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2, py: 1.5 }}>
                                            <ListItemIcon sx={{ color: 'error.main', minWidth: 40 }}><Logout /></ListItemIcon>
                                            <ListItemText primary={t('auth.logout')} primaryTypographyProps={{ color: 'error.main', fontWeight: 800 }} />
                                        </ListItemButton>
                                    </ListItem>
                                </List>
                            </SwipeableDrawer>
                        )}
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
