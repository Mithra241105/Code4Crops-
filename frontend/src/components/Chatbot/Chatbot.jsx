import React, { useState, useRef, useEffect } from 'react';
import { Box, Card, IconButton, Typography, TextField, Button, CircularProgress, Collapse, Chip } from '@mui/material';
import { Chat, Close, Send, SmartToy } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';

const LANG_LABELS = { en: 'EN', hi: 'हि', ta: 'த' };

const Chatbot = () => {
    const { t, i18n } = useTranslation();
    const currentLang = i18n.language?.split('-')[0] || 'en';
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    // Initialize welcome message on open
    useEffect(() => {
        if (open && messages.length === 0) {
            setMessages([{ role: 'assistant', content: t('chat.welcome'), timestamp: new Date() }]);
        }
    }, [open]);

    // Update welcome message when language changes (if chat is empty or only has system msg)
    useEffect(() => {
        setMessages(prev => {
            if (prev.length <= 1 && prev[0]?.role === 'assistant') {
                return [{ role: 'assistant', content: t('chat.welcome'), timestamp: new Date() }];
            }
            return prev;
        });
    }, [currentLang]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;
        const userMsg = { role: 'user', content: input, timestamp: new Date() };
        const history = [...messages, userMsg].filter(m => m.role !== 'system');
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);
        try {
            const lang = i18n.language?.split('-')[0] || 'en';
            const { data } = await api.post('/chat', {
                messages: history.map(m => ({ role: m.role, content: m.content })),
                language: lang,
            });
            setMessages(prev => [...prev, { ...data.message, timestamp: new Date(), source: data.source }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I could not connect. Please try again.', timestamp: new Date() }]);
        } finally { setLoading(false); }
    };

    const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

    return (
        <>
            {/* Floating button */}
            {!open && (
                <Box sx={{ position: 'fixed', bottom: { xs: 80, sm: 24 }, right: 24, zIndex: 1200 }}>
                    <IconButton
                        onClick={() => setOpen(true)}
                        sx={{
                            width: 56, height: 56, bgcolor: 'primary.main', color: 'white',
                            boxShadow: '0 8px 24px rgba(46,125,50,0.4)',
                            '&:hover': { bgcolor: 'primary.dark', transform: 'scale(1.05)' },
                            transition: 'all 0.2s ease',
                        }}
                    >
                        <Chat />
                    </IconButton>
                </Box>
            )}

            {/* Chat panel */}
            {open && (
                <Box sx={{
                    position: 'fixed', bottom: { xs: 80, sm: 24 }, right: 24, zIndex: 1200,
                    width: { xs: 'calc(100vw - 48px)', sm: 360 }, maxWidth: 360,
                }}>
                    <Card sx={{ display: 'flex', flexDirection: 'column', height: 480, boxShadow: '0 16px 48px rgba(0,0,0,0.15)' }}>
                        {/* Header */}
                        <Box sx={{
                            px: 2, py: 1.5, background: 'linear-gradient(135deg, #2E7D32, #1B5E20)',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        }}>
                            <Box display="flex" alignItems="center" gap={1}>
                                <SmartToy sx={{ color: 'white', fontSize: 22 }} />
                                <Typography variant="body1" fontWeight={700} color="white">{t('chat.title')}</Typography>
                            </Box>
                            <Box display="flex" gap={1} alignItems="center">
                                <Chip label={LANG_LABELS[currentLang] || currentLang.toUpperCase()} size="small"
                                    sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: 'white', fontSize: '0.7rem', height: 20, fontWeight: 700 }} />
                                <Chip label={t('chat.offline')} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.75)', fontSize: '0.6rem', height: 18 }} />
                                <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: 'white' }}><Close fontSize="small" /></IconButton>
                            </Box>
                        </Box>

                        {/* Messages */}
                        <Box sx={{ flex: 1, overflow: 'auto', px: 2, py: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {messages.map((msg, i) => (
                                <Box key={i} sx={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                    <Box sx={{
                                        maxWidth: '85%', px: 1.5, py: 1, borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                        bgcolor: msg.role === 'user' ? 'primary.main' : '#F5F5F5',
                                        color: msg.role === 'user' ? 'white' : 'text.primary',
                                    }}>
                                        <Typography variant="body2" whiteSpace="pre-wrap">{msg.content}</Typography>
                                    </Box>
                                </Box>
                            ))}
                            {loading && (
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Box sx={{ bgcolor: '#F5F5F5', borderRadius: '16px 16px 16px 4px', px: 2, py: 1 }}>
                                        <CircularProgress size={16} />
                                    </Box>
                                </Box>
                            )}
                            <div ref={bottomRef} />
                        </Box>

                        {/* Input */}
                        <Box sx={{ px: 1.5, py: 1.5, borderTop: '1px solid rgba(0,0,0,0.08)', display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                            <TextField
                                placeholder={t('chat.placeholder')}
                                value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
                                multiline maxRows={3} size="small" fullWidth variant="outlined"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                            />
                            <IconButton
                                onClick={sendMessage} disabled={!input.trim() || loading}
                                sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' }, '&:disabled': { bgcolor: '#E0E0E0' }, borderRadius: 2, width: 40, height: 40 }}
                            >
                                <Send fontSize="small" />
                            </IconButton>
                        </Box>
                    </Card>
                </Box>
            )}
        </>
    );
};

export default Chatbot;
