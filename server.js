const express = require('express');
const path = require('path');
const app = express();

const API = 'https://api.mail.tm';
const PASSWORD = 'TempMail!2026'; // mandatory complexity for mail.tm

// minimal JSON body parse
app.use(express.json());

async function api(path, opts = {}) {
  const res = await fetch(API + path, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const err = new Error(data['hydra:description'] || data.detail || res.statusText);
    err.status = res.status;
    throw err;
  }
  return data;
}

// 1. get available domain
app.get('/api/domain', async (req, res) => {
  try {
    const d = await api('/domains');
    res.json({ domain: d['hydra:member'][0].domain });
  } catch (e) { res.status(e.status || 500).json({ error: e.message }); }
});

// 2. account -> token
app.post('/api/account', async (req, res) => {
  const { address } = req.body;
  try {
    try {
      await api('/accounts', { method: 'POST', body: JSON.stringify({ address, password: PASSWORD }) });
    } catch (e) {
      // account may already exist -> ignore, token creation will validate login
    }
    const t = await api('/token', { method: 'POST', body: JSON.stringify({ address, password: PASSWORD }) });
    res.json({ token: t.token, address });
  } catch (e) { res.status(e.status || 500).json({ error: e.message }); }
});

// 3. list messages
app.get('/api/messages', async (req, res) => {
  const { token } = req.query;
  try {
    const m = await api('/messages?page=1', { headers: { Authorization: `Bearer ${token}` } });
    res.json(m['hydra:member'] || []);
  } catch (e) { res.status(e.status || 500).json({ error: e.message }); }
});

// 4. single message (full html)
app.get('/api/message', async (req, res) => {
  const { token, id } = req.query;
  try {
    res.json(await api(`/messages/${id}`, { headers: { Authorization: `Bearer ${token}` } }));
  } catch (e) { res.status(e.status || 500).json({ error: e.message }); }
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(3000, () => console.log('temp-email running at http://localhost:3000'));