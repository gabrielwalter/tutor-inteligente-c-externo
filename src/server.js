const express = require('express');
const fetch = require('node-fetch');
const showdown = require('showdown');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const converter = new showdown.Converter();

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

async function callGemini(systemPrompt, conversation, expectJson = true) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('Chave da API do Gemini não encontrada no servidor.');
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    const payload = {
        contents: conversation,
        systemInstruction: { parts: [{ text: systemPrompt }] },
    };
    if (expectJson) payload.generationConfig = { responseMimeType: "application/json" };

    try {
        const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!response.ok) {
             const errorBody = await response.text();
             console.error("Erro da API Gemini:", errorBody);
             throw new Error(`Erro na API do Gemini: ${response.statusText}`);
        }
        const result = await response.json();
        if (result.candidates && result.candidates.length > 0) {
             return result.candidates[0].content.parts[0].text;
        }
        if (result.promptFeedback) {
             console.error("Feedback do Prompt:", result.promptFeedback);
             throw new Error(`A IA bloqueou a resposta. Motivo: ${result.promptFeedback.blockReason}`);
        }
        throw new Error("Resposta da IA em formato inválido ou vazia.");
    } catch (error) {
        console.error('Erro na função callGemini:', error);
        throw error; // Re-throw the error to be caught by the route handler
    }
}

app.post('/api/generate-exercise', async (req, res) => {
    try {
        const { topicName, difficulty } = req.body;
        const systemPrompt = `Você é um gerador de exercícios de programação em C para universitários. Crie um exercício apropriado para uma prova sem consulta. Responda APENAS com um objeto JSON válido, sem markdown.`;
        const userPrompt = `Gere um exercício de C sobre o tópico: "${topicName}" com dificuldade "${difficulty}". O JSON deve ter a seguinte estrutura: {"enunciado": "texto do enunciado", "prototipo": "protótipo da função principal em C ou estrutura básica do código"}`;
        const conversation = [{ role: 'user', parts: [{ text: userPrompt }] }];
        const responseText = await callGemini(systemPrompt, conversation, true);
        res.json(JSON.parse(responseText));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/analyze-plan', async (req, res) => {
    try {
        const { exercise, lepeesData } = req.body;
        const systemPrompt = `Você é um tutor de C. Analise o planejamento LEPEEs de um aluno. Forneça feedback pedagógico em Markdown. No final, diga se ele está pronto para codificar. Responda em JSON: {"feedback": "seu_feedback_em_markdown", "readyToCode": boolean}`;
        const userPrompt = `Exercício: "${exercise}"\n\nPlanejamento:\n${JSON.stringify(lepeesData, null, 2)}`;
        const conversation = [{ role: 'user', parts: [{ text: userPrompt }] }];
        const responseText = await callGemini(systemPrompt, conversation, true);
        const result = JSON.parse(responseText);
        res.json({ feedbackHtml: converter.makeHtml(result.feedback), readyToCode: result.readyToCode });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/analyze-code', async (req, res) => {
    try {
        const { history } = req.body;
        const systemPrompt = `Você é um tutor de C empático e perspicaz, em uma conversa contínua. Sua tarefa é analisar o código de um aluno.
            **Contexto da Conversa:** A seguir, há o histórico da sua conversa com o aluno sobre este exercício específico. Use-o para entender o que já foi corrigido.
            **Sua Tarefa:**
            1.  **Compare** o código atual com as versões anteriores (se houver no histórico).
            2.  **Elogie** as correções que o aluno fez com sucesso.
            3.  **Foque** o novo feedback nos erros que persistem ou em novos problemas. Não repita feedback para coisas que já foram corrigidas.
            4.  **Avalie o Domínio:** Com base no desempenho, decida o próximo passo.
            5.  **Resposta em JSON:** Sua resposta DEVE ser um único objeto JSON válido.

            **Estrutura do JSON:**
            {
              "feedback": "Seu feedback comparativo em markdown.",
              "assessment": {
                "nextAction": "'PROCEED' (se dominou), 'REINFORCE' (se acertou mas pode melhorar), ou 'REDO' (se ainda tem erros)",
                "message": "Uma mensagem encorajadora para o aluno sobre o próximo passo.",
                "topicName": "O nome do tópico do exercício atual (ex: 'Funções')",
                "topicId": "o id do tópico (ex: 'funcoes')"
              }
            }`;
        
        const responseText = await callGemini(systemPrompt, history, true);
        const result = JSON.parse(responseText);
        res.json({ feedbackHtml: converter.makeHtml(result.feedback), assessment: result.assessment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/chat', async (req, res) => {
    try {
        const { history } = req.body;
        const systemPrompt = `Você é um tutor de C. Responda a última pergunta do aluno, mantendo o contexto da conversa. Responda de forma clara e didática em Markdown.`;
        const responseText = await callGemini(systemPrompt, history, false);
        res.json({ replyHtml: converter.makeHtml(responseText) });
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

