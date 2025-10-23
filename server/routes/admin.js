import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';

const router = express.Router();

function adminAuth(req, res, next) {
  const token = req.headers['x-admin-secret'] || '';
  if (!process.env.ADMIN_SECRET || token !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'forbidden' });
  }
  next();
}

router.get('/users', adminAuth, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT id, name, email, created_at FROM users ORDER BY created_at DESC');
    res.json({ users: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'erro interno' });
  }
});

router.post('/users/:id/reset-password', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ error: 'senha inválida (mínimo 6 caracteres)' });
    const hash = bcrypt.hashSync(newPassword, 10);
    await db.query('UPDATE users SET password_hash=$1 WHERE id=$2', [hash, id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'erro interno' });
  }
});

router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM users WHERE id=$1', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'erro interno' });
  }
});

export default router;
