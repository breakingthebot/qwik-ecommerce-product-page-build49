// server.js
// Express Server for Build 49 - Qwik E-Commerce Product Page.
// Created: 2026-07-28

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint for Qwik resumable state verification
app.get('/api/product', (req, res) => {
  res.json({
    success: true,
    message: 'Qwik Resumable Product Page API',
    timestamp: new Date().toISOString()
  });
});

// Fallback route serving index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`⚡ Qwik E-Commerce Product Page running at http://localhost:${PORT}`);
});
