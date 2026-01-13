require('dotenv').config();
import express from 'express';

const app = express();

const PORT = process.env.PORT || 3003;

app.get('/health', (_req, res) => {
  res.json({ status: 'Auth Service is running and healthy' });
});

app.listen(PORT, () => {
  console.log(`Auth Service is running on port ${PORT}`);
});