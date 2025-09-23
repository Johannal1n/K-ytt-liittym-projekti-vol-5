import express from 'express';
import cors from 'cors';
import absenceRoutes from './routes/absenceRoutes.js';

const app = express();
const PORT = 3001;

console.log('[BOOT] server starting…');

// Middleware
app.use(cors());
app.use(express.json());

// 🔹 Väliaikainen testireitti (varmistaa PATCH-toimivuuden)
app.patch('/api/_test', (req, res) => {
  console.log('[TOP-LEVEL PATCH] body=', req.body);
  res.json({ ok: true, got: req.body });
});

// 🔹 Varsinaiset API-reitit
app.use('/api', absenceRoutes);

// Testireitti
app.get('/', (_req, res) => {
  res.send('Poissaolosovellus käynnissä!');
});

// Käynnistetään palvelin
app.listen(PORT, () => {
  console.log(`Palvelin käynnissä osoitteessa http://localhost:${PORT}`);
});
