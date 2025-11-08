require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
const mongoose = require('mongoose');
const Product = require('./backend/models/Product.js')(mongoose);

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Mongo connected successfully'))
  .catch(err => { console.error('Mongo error', err); process.exit(1); });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ---------------------- helpers for functions ----------------------
const toStr = (v) => (v == null ? '' : String(v));
const normKey = (k) => toStr(k).trim().toLowerCase().replace(/\s+/g, '_');

function esc(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}

const CAT_ALIASES = {
  cpu: ['cpu','processor','processors'],
  motherboard: ['motherboard','mobo','mainboard'],
  ram: ['ram','memory','system memory','memory (ram)','ddr','ddr4','ddr5','dimm','so-dimm','sodimm', 'RAM'],
  storage: ['storage','ssd','hdd','nvme','solid state','solid-state'],
  gpu: ['gpu','graphics card','video card','graphics','vga'],
  psu: ['psu','power supply','power-supply'],
  case: ['case','chassis','tower'],
};

async function byCatLoose(cat) {
  const names = CAT_ALIASES[cat] || [cat];
  const ors = [
    // match category loosely (handles wrong/missing/variant labels)
    ...names.map(n => ({ category: { $regex: esc(n), $options: 'i' } })),
    // also match by NAME as a fallback
    ...names.map(n => ({ name: { $regex: esc(n), $options: 'i' } })),
  ];
  const rows = await Product.find({ $or: ors }).sort({ price: 1 }).lean();
  return sanitize(rows);
}

// parse stuff like "$499.61 USD" to just a number
function parseNumberString(s) {
  if (!s) return null;
  const n = String(s).replace(/[^0-9.]/g, '');
  if (!n) return null;
  const num = Number(n);
  return Number.isFinite(num) ? num : null;
}

function normalizeSpecs(specs) {
  const out = {};
  if (!specs) return out;
  for (const [kRaw, v] of Object.entries(specs)) {
    out[normKey(kRaw)] = toStr(v);
  }
  return out;
}

function sanitize(rows) {
  return rows.map(p => ({
    id: p._id?.toString(),
    sku: p.sku,
    name: p.name,
    price: Number(p.price),
    category: p.category,
    brand: p.brand,
    stockQuantity: p.stockQuantity,
    inStock: !!p.inStock,
    images: (p.images || []).map(i => ({ url: i.url, alt: i.alt })),
    specifications: normalizeSpecs(p.specifications || {})
  }));
}

const eqLoose = (a, b) =>
  toStr(a).replace(/\s+/g, '').toLowerCase() === toStr(b).replace(/\s+/g, '').toLowerCase();

// ---------------------- data access ----------------------
function mkRegex(q) {
  try { return new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'); }
  catch { return new RegExp(q, 'i'); }
}

async function searchProducts({ query = '', filters = {}, limit = 10 }) {
  const rx = query ? mkRegex(query) : null;
  const m = {
    ...(rx ? { $or: [{ name: rx }, { brand: rx }, { category: rx }, { sku: rx }] } : {})
  };
  // in searchProducts(), change strict equals to tolerant contains:
  if (filters.category) m.category = { $regex: filters.category.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), $options: 'i' };
  if (filters.brand)    m.brand    = { $regex: filters.brand.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), $options: 'i' };

  // spec filters as strings
  if (filters.socket) m['specifications.socket'] = new RegExp(`^${filters.socket}$`, 'i');
  if (filters.memory_type) m['specifications.memory_type'] = new RegExp(`^${filters.memory_type}$`, 'i');

  if (filters.maxPrice != null) m.price = { ...(m.price || {}), $lte: Number(filters.maxPrice) };

  const items = await Product.find(m).limit(Number(limit) || 10).lean();
  return sanitize(items);
}

async function getProductByIdOrSku(idOrSku) {
  if (!idOrSku) return null;
  let item = null;
  if (/^[0-9a-fA-F]{24}$/.test(idOrSku)) item = await Product.findById(idOrSku).lean();
  if (!item) item = await Product.findOne({ sku: idOrSku }).lean();
  if (!item) item = await Product.findOne({ name: idOrSku }).lean();
  if (!item) item = await Product.findOne({ name: mkRegex(idOrSku) }).lean();
  return item ? sanitize([item])[0] : null;
}

async function compareProducts(idsOrSkus = []) {
  const items = [];
  for (const key of idsOrSkus) {
    const it = await getProductByIdOrSku(key);
    if (it) items.push(it);
  }
  const cheapest = items.slice().sort((a,b) => a.price - b.price)[0] || null;
  const perf = (p) => parseNumberString(p.specifications.perf_score) || 0;
  const highestPerf = items.slice().sort((a,b) => perf(b) - perf(a))[0] || null;
  return { items, summary: { cheapest, highest_perf: highestPerf } };
}

// ---------------------- compatibility function ----------------------
function checkCompatibility(parts) {
  const issues = [];
  const byCat = (cat) => parts.find(p => toStr(p.category).toLowerCase() === cat);
  const cpu = byCat('cpu');
  const mb  = byCat('motherboard');
  const ram = byCat('ram');
  const specs = (p) => (p ? p.specifications : {});

  if (cpu && mb) {
    const s1 = specs(cpu).socket, s2 = specs(mb).socket;
    if (s1 && s2 && !eqLoose(s1, s2)) issues.push(`CPU socket ${s1} ≠ motherboard socket ${s2}`);
  }
  if (ram && mb) {
    const r = specs(ram).memory_type, m = specs(mb).memory_type;
    if (r && m && !eqLoose(r, m)) issues.push(`RAM type ${r} ≠ motherboard memory type ${m}`);
  }
  return { ok: issues.length === 0, issues };
}

// ---------------------- recommended build function ----------------------

async function recommendBuild({ budget, target = 'balanced' }) {
  const sNorm = (x) => (x ? String(x).toLowerCase().replace(/\s+/g, '') : '');
  const specs = (p) => (p ? p.specifications || {} : {});

  const byCat = byCatLoose;

  let spend = 0;
  const pick = [];

  // CPU first
  const cpus = await byCat('cpu');
  if (!cpus.length) return { ok: false, reason: 'No CPUs available.' };
  const cpu = cpus[0]; pick.push(cpu); spend += cpu.price;

  // Matching MB by socket
  const cpuSocket = sNorm(specs(cpu).socket);
  const mbs = await byCat('motherboard');
  if (!mbs.length) return { ok: false, reason: 'No motherboards available.' };
  let mb = mbs.find(m => sNorm(specs(m).socket) && sNorm(specs(m).socket) === cpuSocket) || mbs[0];
  pick.push(mb); spend += mb.price;

  // Matching RAM by memory_type
  const mbMemType = sNorm(specs(mb).memory_type);
  const rams = await byCat('ram');
  if (!rams.length) return { ok: false, reason: 'No RAM available.' };
  let ram = rams.find(r => sNorm(specs(r).memory_type) && sNorm(specs(r).memory_type) === mbMemType) || rams[0];
  pick.push(ram); spend += ram.price;

  // Rest (cheapest baseline)
  for (const cat of ['storage','gpu','psu','case']) {
    const opts = await byCat(cat);
    if (!opts.length) continue;
    const chosen = opts[0];
    pick.push(chosen); spend += chosen.price;
  }

  if (spend > budget) {
    return { ok: false, reason: `Cheapest compatible baseline (~$${spend.toFixed(2)}) exceeds budget $${budget}.` };
  }

  // Upgrades (performance target)
  const headroom = () => budget - spend;
  const perfScore = (p) => parseNumberString(specs(p).perf_score) || 0;

  async function tryUpgrade(cat) {
    const options = await byCat(cat);
    const current = pick.find(p => String(p.category).toLowerCase() === cat);
    if (!current) return false;

    const cand = options
      .filter(o => perfScore(o) > perfScore(current))
      .sort((a, b) => perfScore(b) - perfScore(a));

    for (const opt of cand) {
      const delta = opt.price - current.price;
      if (delta <= headroom()) {
        if (cat === 'cpu') {
          const s = sNorm(specs(opt).socket);
          if (s && sNorm(specs(mb).socket) && s !== sNorm(specs(mb).socket)) continue;
        }
        if (cat === 'motherboard') {
          const s = sNorm(specs(opt).socket);
          if (s && cpuSocket && s !== cpuSocket) continue;
        }
        if (cat === 'ram') {
          const t = sNorm(specs(opt).memory_type);
          if (t && mbMemType && t !== mbMemType) continue;
        }
        spend += delta;
        pick.splice(pick.indexOf(current), 1, opt);
        return true;
      }
    }
    return false;
  }

  if (target === 'performance') {
    for (let i = 0; i < 3; i++) {
      await tryUpgrade('gpu');
      await tryUpgrade('cpu');
    }
  }

  const compat = checkCompatibility(pick);
  return { ok: true, spend, pick, compat, budget, leftover: budget - spend };
}

// ---------------------- tools ----------------------
const tools = [
  {
    type: 'function',
    function: {
      name: 'search_products',
      description: 'Search catalog with optional filters (string-based specs).',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string' },
          filters: {
            type: 'object',
            properties: {
              category: { type: 'string' },
              brand: { type: 'string' },
              socket: { type: 'string' },
              memory_type: { type: 'string' },
              maxPrice: { anyOf: [{ type: 'number' }, { type: 'string' }] }
            }
          },
          limit: { anyOf: [{ type: 'number' }, { type: 'string' }] }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_product',
      description: 'Get a product by _id, SKU, or exact/loose name.',
      parameters: {
        type: 'object',
        properties: { idOrSku: { type: 'string' } }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'compare_products',
      description: 'Compare multiple products (string specs parsed).',
      parameters: {
        type: 'object',
        properties: { idsOrSkus: { type: 'array', items: { type: 'string' } } }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'recommend_build',
      description: 'Compatible PC build under a budget (strings OK).',
      parameters: {
        type: 'object',
        properties: {
          budget: { anyOf: [{ type: 'number' }, { type: 'string' }] },
          target: { type: 'string', enum: ['balanced','performance'] }
        },
        required: ['budget']
      }
    }
  }
];

// ---------------------- tool runner ----------------------
async function runToolCall(call) {
  const { name, arguments: argsJson } = call.function;
  const args = JSON.parse(argsJson || '{}');

  const toNum = (v, fallback) => {
    if (v === null || v === undefined || v === '') return fallback;
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };

  if (name === 'search_products') {
    const filters = args.filters || {};
    const payload = {
      query: args.query || '',
      filters: {
        ...filters,
        maxPrice: filters.maxPrice !== undefined ? toNum(filters.maxPrice, undefined) : undefined
      },
      limit: toNum(args.limit, 10)
    };
    return JSON.stringify(await searchProducts(payload));
  }

  if (name === 'get_product') {
    return JSON.stringify(await getProductByIdOrSku(args.idOrSku));
  }

  if (name === 'compare_products') {
    return JSON.stringify(await compareProducts(args.idsOrSkus || []));
  }

  if (name === 'recommend_build') {
    const budget = toNum(args.budget, 0);
    const target = args.target || 'balanced';
    return JSON.stringify(await recommendBuild({ budget, target }));
  }

  return JSON.stringify({ error: 'unknown tool' });
}

// Route for chat bot to follow
app.post('/api/chat', async (req, res) => {
  console.log('POST /api/chat start');
  const { messages, model = 'llama-3.3-70b-versatile', temperature = 0.3 } = req.body || {};
  console.log('messages type:', Array.isArray(messages) ? 'array' : typeof messages);

  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages must be an array [{role,content}]' });
  }

  const system = {
    role: 'system',
    content:
      'You are a PC parts assistant for our store. ' +
      'ALWAYS use tools for prices, stock, and compatibility. ' +
      'If user provides budget, call recommend_build; if they ask to compare, call compare_products; ' +
      'if items are ambiguous, call search_products to get candidates, then ask for clarification. ' +
      'When using tools, prefer numeric types for numeric fields.'+
      'If the user says hello, chats casually, or asks something NOT about PC parts, respond normally like a friendly assistant.'+
      'If unsure, ask clarifying questions instead of calling tools.'
  };

  // Firstly, decide what tool to use (planning call)
  let first;
  try {
    first = await groq.chat.completions.create({
      model,
      temperature,
      stream: false,
      tools,
      tool_choice: 'auto',
      max_tokens: 64,
      messages: [system, ...messages]
    });
  } catch (err) {
    console.error('Groq error (first planning call):', err?.status, err?.message, err?.response?.data || '');
    return res.status(500).end('Server error (first)');
  }

  const planMsg = first.choices?.[0]?.message || {};
  const toolCalls = planMsg.tool_calls || [];

  // Next, if nothing is used like recommBuild, priceCheck, etc. just reply normally
if (toolCalls.length === 0) {
  console.log('No tool calls; normal reply');
  try {
    const reply = await groq.chat.completions.create({
      model,
      temperature,
      stream: false,
      messages: [system, ...messages]
    });
    let text = reply.choices?.[0]?.message?.content?.trim();
    if (!text) {
      text = "Hello, how can I help you today?";
    }
    return res
      .status(200)
      .set('Content-Type', 'text/plain; charset=utf-8')
      .end(text);
  } catch (err) {
    console.error('Normal reply error:', err);
    return res.status(500).end('Server error (normal reply)');
  }
}

  // If tool is used, use the tool corresponding to what is needed
  console.log('Tool calls:', toolCalls.map(t => t.function?.name));
  const toolResults = [];
  try {
    for (const call of toolCalls) {
      const result = await runToolCall(call);
      toolResults.push({ role: 'tool', tool_call_id: call.id, name: call.function.name, content: result });
    }
  } catch (err) {
    console.error('Tool execution error:', err);
    return res.status(500).end('Server error (tool run)');
  }

  // Follow-up answer (do NOT call tools again)
  try {
    const followup = await groq.chat.completions.create({
      model,
      temperature,
      stream: false,
      max_tokens: 512,
      tools,
      tool_choice: 'none',
      messages: [
        system,
        ...messages,
        planMsg,
        ...toolResults,
        {
          role: 'system',
          content:
            'Use ONLY the provided tool results above to answer. Do NOT call tools again. ' +
            'Do NOT output <function=...> blocks. Provide a clean, user-facing answer.'
        }
      ]
    });
    const choice = followup.choices?.[0];
    console.log('Followup raw choice:', JSON.stringify(choice, null, 2));
    let text = choice?.message?.content;
    if (!text || !text.trim()) text = '[[empty reply from model]]';
    console.log('Followup answer length:', text.length);
    return res.status(200).set('Content-Type', 'text/plain; charset=utf-8').end(text);
  } catch (err) {
    console.error('Groq error (followup):', err?.status, err?.message, err?.response?.data || '');
    return res.status(500).end('Server error (followup)');
  }
});

// --------- debug helpers ---------------
// go to http://localhost:3001/health to check if server is working
// if it says "ok" then its working
app.get('/health', (_, res) => res.send('ok'));

// open to see categories in DB (used for debugging if db for certain categories aren't working)
//http://localhost:3001/debug/categories
app.get('/debug/categories', async (_req, res) => {
  const rows = await Product.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  res.json(rows);
});

// --- start server ---
const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`API on http://localhost:${port}`));
