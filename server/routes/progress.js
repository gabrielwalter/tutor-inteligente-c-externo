import express from 'express';
import jwt from 'jsonwebtoken';
import db from '../db.js';

const router = express.Router();

function auth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'não autorizado' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'token inválido' });
  }
}

router.get('/', auth, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT data FROM progress WHERE user_id = $1', [req.userId]);
    if (!rows[0]) return res.json({ data: {} });
    res.json({ data: rows[0].data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'erro interno' });
  }
});

router.put('/', auth, async (req, res) => {
  try {
    const data = req.body.data || {};
    await db.query(`
      INSERT INTO progress (user_id, data, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
    `, [req.userId, data]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'erro interno' });
  }
});

export default router;
