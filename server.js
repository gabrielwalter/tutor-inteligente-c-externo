import express from 'express';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';
import showdown from 'showdown';

const app = express();
const converter = new showdown.Converter();
const __dirname = path.resolve();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Função auxiliar para limpar JSON retornado pelo Gemini
function cleanJsonResponse(text) {
    // Remove blocos de código markdown se existirem
    let cleaned = text.trim();
    if (cleaned.startsWith('```
        cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```
    } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^``````\s*$/, '');
    }
    return cleaned.trim();
}

async function callGemini(systemPrompt, userPrompt, expectJson = true) {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: systemPrompt,
    });

    const generationConfig = expectJson ? { responseMimeType: "application/json" } : {};
    const result = await model.generateContent(userPrompt, generationConfig);
    const response = await result.response;
    return response.text();
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint para gerar exercícios
app.post('/api/generate-exercise', async (req, res) => {
    try {
        const { topicName, difficulty = 'normal' } = req.body;
        const systemPrompt = `Você é um gerador de exercícios de C. Crie um exercício sobre "${topicName}" com dificuldade ${difficulty}. Responda APENAS com JSON válido no formato: {"enunciado": "...", "prototipo": "// código inicial aqui"}`;
        const userPrompt = `Gere um exercício prático sobre ${topicName}.`;
        const responseText = await callGemini(systemPrompt, userPrompt, true);
        const cleanedText = cleanJsonResponse(responseText);
        const result = JSON.parse(cleanedText);
        res.json(result);
    } catch (error) {
        console.error('Erro em /api/generate-exercise:', error);
        console.error('Resposta recebida:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint para analisar plano LEPEEs
app.post('/api/analyze-plan', async (req, res) => {
    try {
        const { exercise, lepeesData } = req.body;
        const systemPrompt = `Você é um tutor de C. Analise o planejamento LEPEEs do aluno. Verifique se ele entendeu o problema e planejou bem. Responda APENAS com JSON válido no formato: {"feedback": "...", "readyToCode": boolean}`;
        const userPrompt = `Exercício: "${exercise}"\n\nPlanejamento do aluno:\n${JSON.stringify(lepeesData, null, 2)}`;
        const responseText = await callGemini(systemPrompt, userPrompt, true);
        const cleanedText = cleanJsonResponse(responseText);
        const result = JSON.parse(cleanedText);
        res.json({ feedbackHtml: converter.makeHtml(result.feedback), readyToCode: result.readyToCode });
    } catch (error) {
        console.error('Erro em /api/analyze-plan:', error);
        console.error('Resposta recebida:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint para analisar código
app.post('/api/analyze-code', async (req, res) => {
    try {
        const { exercise, code, history } = req.body;
        const systemPrompt = `Você é um tutor de C. Analise o código do aluno no contexto do histórico da conversa. Elogie as correções. Foque nos erros restantes. Avalie o domínio e sugira o próximo passo (PROCEED, REINFORCE, REDO). Responda APENAS com JSON válido no formato: {"feedback": "...", "assessment": {"nextAction": "...", "message": "...", "topicName": "...", "topicId": "..."}}`;
        const userPrompt = `Contexto: ${JSON.stringify(history)}\n\nExercício: "${exercise}"\n\nCódigo Atual:\n${code}`;
        const responseText = await callGemini(systemPrompt, userPrompt, true);
        const cleanedText = cleanJsonResponse(responseText);
        const result = JSON.parse(cleanedText);
        res.json({ feedbackHtml: converter.makeHtml(result.feedback), assessment: result.assessment });
    } catch (error) {
        console.error('Erro em /api/analyze-code:', error);
        console.error('Resposta recebida:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint para chat
app.post('/api/chat', async (req, res) => {
    try {
        const { history } = req.body;
        const systemPrompt = `Você é um tutor de C respondendo dúvidas do aluno sobre o feedback anterior. Seja conciso e didático.`;
        const userPrompt = JSON.stringify(history);
        const responseText = await callGemini(systemPrompt, userPrompt, false);
        res.json({ replyHtml: converter.makeHtml(responseText) });
    } catch (error) {
        console.error('Erro em /api/chat:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
