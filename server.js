// server.js (CommonJS so Node can run it without config)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Quick test endpoint
app.get('/health', (req, res) => {
  res.send('ok');
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, model = 'llama-3.3-70b-versatile', temperature = 0.3 } = req.body;

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');

    const stream = await groq.chat.completions.create({
      model,
      messages,
      temperature,
      stream: true
    });

    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta?.content || '';
      if (delta) res.write(delta);
    }

    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).end('Server error');
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`✅ Groq server running at http://localhost:${port}`));
