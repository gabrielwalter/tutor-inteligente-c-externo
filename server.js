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

async function callGemini(systemPrompt, userPrompt, expectJson = true) {
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
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

app.post('/api/analyze-code', async (req, res) => {
    try {
        const { exercise, code, history } = req.body;
        const systemPrompt = `És um tutor de C. Analisa o código do aluno no contexto do histórico da conversa. Elogia as correções. Foca-te nos erros restantes. Avalia o domínio e sugere o próximo passo (PROCEED, REINFORCE, REDO). Responde em JSON: {"feedback": "...", "assessment": {"nextAction": "...", "message": "...", "topicName": "...", "topicId": "..."}}`;
        const userPrompt = `Contexto: ${JSON.stringify(history)}\n\nExercício: "${exercise}"\n\nCódigo Atual:\n${code}`;
        const responseText = await callGemini(systemPrompt, userPrompt, true);
        const result = JSON.parse(responseText);
        res.json({ feedbackHtml: converter.makeHtml(result.feedback), assessment: result.assessment });
    } catch (error) {
        console.error('Erro em /api/analyze-code:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor a rodar na porta ${PORT}`);
});


