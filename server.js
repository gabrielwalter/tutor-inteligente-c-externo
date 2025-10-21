import express from 'express';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';
import showdown from 'showdown';

const app = express();
const converter = new showdown.Converter();
const __dirname = path.resolve();

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Verificar se a API key está configurada
if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY não está configurada!');
    console.error('Configure a variável de ambiente GEMINI_API_KEY');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Função auxiliar para limpar JSON retornado pelo Gemini
function cleanJsonResponse(text) {
    // Remove blocos de código markdown se existirem
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
    } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
    }
    return cleaned.trim();
}

async function callGemini(systemPrompt, userPrompt, expectJson = true) {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: systemPrompt,
        });

        const generationConfig = expectJson ? { responseMimeType: "application/json" } : {};
        
        // Adicionar timeout de 30 segundos
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout: Gemini API demorou mais de 30 segundos')), 30000);
        });
        
        const apiPromise = model.generateContent(userPrompt, generationConfig);
        const result = await Promise.race([apiPromise, timeoutPromise]);
        
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('❌ Erro na chamada Gemini API:', error.message);
        throw error;
    }
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint para o Render
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Endpoint para gerar exercícios
app.post('/api/generate-exercise', async (req, res) => {
    try {
        const { topicName, difficulty = 'normal' } = req.body;
        
        // Validação de entrada
        if (!topicName || typeof topicName !== 'string' || topicName.trim().length === 0) {
            return res.status(400).json({ error: 'topicName é obrigatório e deve ser uma string não vazia' });
        }
        
        const validDifficulties = ['easy', 'normal', 'hard'];
        if (!validDifficulties.includes(difficulty)) {
            return res.status(400).json({ error: 'difficulty deve ser: easy, normal ou hard' });
        }
        const systemPrompt = `Você é um gerador de exercícios de C. Crie um exercício sobre "${topicName}" com dificuldade ${difficulty}. Responda APENAS com JSON válido no formato: {"enunciado": "...", "prototipo": "// código inicial aqui"}`;
        const userPrompt = `Gere um exercício prático sobre ${topicName}.`;
        const responseText = await callGemini(systemPrompt, userPrompt, true);
        const cleanedText = cleanJsonResponse(responseText);
        const result = JSON.parse(cleanedText);
        res.json(result);
    } catch (error) {
        console.error('Erro em /api/generate-exercise:', error);
        res.status(500).json({ error: error.message || 'Erro interno do servidor' });
    }
});

// Endpoint para analisar plano LEPEBES
app.post('/api/analyze-plan', async (req, res) => {
    try {
        const { exercise, lepeesData } = req.body;
        
        // Validação de entrada
        if (!exercise || typeof exercise !== 'string' || exercise.trim().length === 0) {
            return res.status(400).json({ error: 'exercise é obrigatório e deve ser uma string não vazia' });
        }
        
        if (!lepeesData || typeof lepeesData !== 'object') {
            return res.status(400).json({ error: 'lepeesData é obrigatório e deve ser um objeto' });
        }
        const systemPrompt = `Você é um tutor de C. Analise o planejamento LEPEBES do aluno. Verifique se ele entendeu o problema e planejou bem. Responda APENAS com JSON válido no formato: {"feedback": "...", "readyToCode": boolean}`;
        const userPrompt = `Exercício: "${exercise}"\n\nPlanejamento do aluno:\n${JSON.stringify(lepeesData, null, 2)}`;
        const responseText = await callGemini(systemPrompt, userPrompt, true);
        const cleanedText = cleanJsonResponse(responseText);
        const result = JSON.parse(cleanedText);
        res.json({ feedbackHtml: converter.makeHtml(result.feedback), readyToCode: result.readyToCode });
    } catch (error) {
        console.error('Erro em /api/analyze-plan:', error);
        res.status(500).json({ error: error.message || 'Erro interno do servidor' });
    }
});

// Endpoint para analisar código
app.post('/api/analyze-code', async (req, res) => {
    try {
        const { exercise, code, history } = req.body;
        
        // Validação de entrada
        if (!exercise || typeof exercise !== 'string' || exercise.trim().length === 0) {
            return res.status(400).json({ error: 'exercise é obrigatório e deve ser uma string não vazia' });
        }
        
        if (!code || typeof code !== 'string' || code.trim().length === 0) {
            return res.status(400).json({ error: 'code é obrigatório e deve ser uma string não vazia' });
        }
        
        if (!history || !Array.isArray(history)) {
            return res.status(400).json({ error: 'history é obrigatório e deve ser um array' });
        }
        const systemPrompt = `Você é um tutor de C. Analise o código do aluno no contexto do histórico da conversa. Elogie as correções. Foque nos erros restantes. Avalie o domínio e sugira o próximo passo (PROCEED, REINFORCE, REDO). Responda APENAS com JSON válido no formato: {"feedback": "...", "assessment": {"nextAction": "...", "message": "...", "topicName": "...", "topicId": "..."}}`;
        const userPrompt = `Contexto: ${JSON.stringify(history)}\n\nExercício: "${exercise}"\n\nCódigo Atual:\n${code}`;
        const responseText = await callGemini(systemPrompt, userPrompt, true);
        const cleanedText = cleanJsonResponse(responseText);
        const result = JSON.parse(cleanedText);
        res.json({ feedbackHtml: converter.makeHtml(result.feedback), assessment: result.assessment });
    } catch (error) {
        console.error('Erro em /api/analyze-code:', error);
        res.status(500).json({ error: error.message || 'Erro interno do servidor' });
    }
});

// Endpoint para chat
app.post('/api/chat', async (req, res) => {
    try {
        const { history } = req.body;
        
        // Validação de entrada
        if (!history || !Array.isArray(history)) {
            return res.status(400).json({ error: 'history é obrigatório e deve ser um array' });
        }
        const systemPrompt = `Você é um tutor de C respondendo dúvidas do aluno sobre o feedback anterior. Seja conciso e didático.`;
        const userPrompt = JSON.stringify(history);
        const responseText = await callGemini(systemPrompt, userPrompt, false);
        res.json({ replyHtml: converter.makeHtml(responseText) });
    } catch (error) {
        console.error('Erro em /api/chat:', error);
        res.status(500).json({ error: error.message || 'Erro interno do servidor' });
    }
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log('🚀 ===== TUTOR INTELIGENTE DE C =====');
    console.log(`✅ Servidor rodando em http://${HOST}:${PORT}`);
    console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔑 API Key configurada: ${process.env.GEMINI_API_KEY ? '✅ Sim' : '❌ Não'}`);
    console.log('🌐 Acesse o navegador para começar a usar!');
    console.log('=====================================');
});
