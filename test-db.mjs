import express from 'express';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pkg;

// Cria pool de conexão com Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const app = express();

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve os arquivos da pasta "public"
app.use(express.static(path.join(__dirname, "public")));

app.use(bodyParser.json());

// Teste de conexão
app.get('/', async (req, res) => {
  try {
    const r = await pool.query('SELECT NOW()');
    res.json({ ok: true, time: r.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Erro ao conectar ao banco' });
  }
});

// 🧾 Rota de cadastro
app.post('/register', async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Preencha todos os campos!' });
  }

  try {
    const senhaHash = await bcrypt.hash(senha, 10);
    const result = await pool.query(
      'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING id, nome, email',
      [nome, email, senhaHash]
    );
    res.json({ message: 'Usuário criado com sucesso!', user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Erro ao criar usuário (talvez email já exista)' });
  }
});

// 🔐 Rota de login
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

    if (result.rows.length === 0)
      return res.status(401).json({ error: 'Usuário não encontrado' });

    const user = result.rows[0];
    const senhaCorreta = await bcrypt.compare(senha, user.senha);

    if (!senhaCorreta)
      return res.status(401).json({ error: 'Senha incorreta' });

    res.json({ message: 'Login bem-sucedido!', user: { id: user.id, nome: user.nome } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
