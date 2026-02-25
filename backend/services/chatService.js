const axios = require('axios');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';
const GROK_API_KEY = process.env.GROK_API_KEY;

// Agricultural knowledge base for fallback
const AGRI_KNOWLEDGE = {
    profit: "Net Profit = Revenue - Transport Cost - Handling Cost. Revenue = Crop Price × Quantity. Higher crop prices at closer mandis give you maximum profit.",
    wheat: "Wheat (गेहूं/கோதுமை) is typically sold between ₹2,000-₹2,500 per quintal. MSP is set by the government annually.",
    rice: "Rice (चावल/அரிசி) MSP is around ₹2,300 per quintal. Paddy prices vary by season and region.",
    transport: "Vehicle rates: Bike (~₹4/km), Auto (~₹8/km), Mini Truck (~₹18/km), Tractor (~₹14/km). Choose based on your crop quantity.",
    mandi: "A mandi (मंडी/மண்டி) is an agricultural market where farmers sell their produce. They offer better prices than local traders.",
    tips: "Top farming tips: 1) Sell during peak demand periods 2) Use government MSP as minimum price benchmark 3) Plan transport to minimize costs 4) Consider post-harvest handling charges.",
    season: "Best time to sell: Wheat in March-April, Rice in October-November, Vegetables year-round based on demand.",
    default: "I'm your Krishi-Route farming assistant. I can help you understand profit calculations, crop prices, best mandis to sell, and logistics planning. What would you like to know?"
};

const smartFallback = (message, language = 'en') => {
    const msg = message.toLowerCase();
    let response = '';

    if (msg.includes('profit') || msg.includes('लाभ') || msg.includes('இலாபம்')) response = AGRI_KNOWLEDGE.profit;
    else if (msg.includes('wheat') || msg.includes('गेहूं') || msg.includes('கோதுமை')) response = AGRI_KNOWLEDGE.wheat;
    else if (msg.includes('rice') || msg.includes('चावल') || msg.includes('அரிசி')) response = AGRI_KNOWLEDGE.rice;
    else if (msg.includes('transport') || msg.includes('vehicle') || msg.includes('परिवहन')) response = AGRI_KNOWLEDGE.transport;
    else if (msg.includes('mandi') || msg.includes('मंडी') || msg.includes('மண்டி') || msg.includes('market')) response = AGRI_KNOWLEDGE.mandi;
    else if (msg.includes('tip') || msg.includes('advice') || msg.includes('सुझाव')) response = AGRI_KNOWLEDGE.tips;
    else if (msg.includes('season') || msg.includes('time') || msg.includes('मौसम')) response = AGRI_KNOWLEDGE.season;
    else response = AGRI_KNOWLEDGE.default;

    if (language === 'hi') response += "\n\n(कृपया ध्यान दें: ऑफलाइन मोड में सीमित जानकारी उपलब्ध है)";
    if (language === 'ta') response += "\n\n(கவனிக்கவும்: ஆஃப்லைன் முறையில் வரையறுக்கப்பட்ட தகவல்கள் மட்டுமே கிடைக்கும்)";

    return response;
};

const chatWithOllama = async (messages, language) => {
    const systemPrompt = `You are a helpful Smart Agriculture assistant for Krishi-Route, an Indian farming logistics platform. 
  Help farmers and mandi operators with: profit calculations, crop prices, best mandis to sell at, transport advice, farming tips, and app navigation.
  Respond in ${language === 'hi' ? 'Hindi' : language === 'ta' ? 'Tamil' : 'English'}.
  Be concise, friendly and use simple language that rural farmers understand.
  Always provide specific numbers, tips, and actionable advice.`;

    const response = await axios.post(`${OLLAMA_URL}/api/chat`, {
        model: OLLAMA_MODEL,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        stream: false,
    }, { timeout: 30000 });

    return response.data.message.content;
};

const chatWithGrok = async (messages, language) => {
    if (!GROK_API_KEY) throw new Error('Grok API key not configured');

    const systemPrompt = `You are a helpful Smart Agriculture assistant for Krishi-Route, an Indian farming logistics platform.
  Help farmers and mandi operators with: crop prices, profit optimization, transport advice, and farming guidance.
  Respond in ${language === 'hi' ? 'Hindi' : language === 'ta' ? 'Tamil' : 'English'}.
  Be concise and practical. All monetary values should be in Indian Rupees (₹).`;

    const response = await axios.post('https://api.x.ai/v1/chat/completions', {
        model: 'grok-beta',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        max_tokens: 500,
    }, {
        headers: { Authorization: `Bearer ${GROK_API_KEY}`, 'Content-Type': 'application/json' },
        timeout: 30000,
    });

    return response.data.choices[0].message.content;
};

const getResponse = async (messages, language = 'en') => {
    const lastMessage = messages[messages.length - 1]?.content || '';

    // Try Ollama first
    try {
        return { content: await chatWithOllama(messages, language), source: 'ollama' };
    } catch (e) {
        console.log('Ollama unavailable:', e.message);
    }

    // Try Grok fallback
    try {
        return { content: await chatWithGrok(messages, language), source: 'grok' };
    } catch (e) {
        console.log('Grok unavailable:', e.message);
    }

    // Smart rule-based fallback
    return { content: smartFallback(lastMessage, language), source: 'fallback' };
};

module.exports = { getResponse };
