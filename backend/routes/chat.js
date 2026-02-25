const express = require('express');
const router = express.Router();
const { getResponse } = require('../services/chatService');

// POST /api/chat
router.post('/', async (req, res) => {
    try {
        const { messages, language } = req.body;
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: 'messages array required' });
        }

        const { content, source } = await getResponse(messages, language || 'en');
        res.json({ message: { role: 'assistant', content }, source });
    } catch (err) {
        console.error('/chat error:', err);
        res.status(500).json({ error: 'Chat service unavailable' });
    }
});

module.exports = router;
