// Importa as ferramentas necessárias
const express = require('express');
const fetch = require('node-fetch');
const showdown = require('showdown');
require('dotenv').config(); // Para carregar a chave da IA de forma segura

// Cria a aplicação do servidor
const app = express();
app.use(express.json()); // Permite que o servidor entenda JSON
app.use(express.static('public')); // Serve arquivos estáticos (nosso index.html)

// Instancia o conversor de Markdown
const converter = new showdown.Converter();

// O "CÉREBRO" - Este prompt fica SEGURO no servidor
const systemPrompt = `Você é um tutor de C empático e perspicaz. Analise o código do aluno e forneça feedback pedagógico.
1. Infira o raciocínio do aluno.
2. Explique os erros e guie para a solução.
3. Responda em JSON: {"feedback": "seu_feedback_em_markdown", "isCorrect": boolean}`;

// Endpoint que o front-end vai chamar
app.post('/analyze', async (req, res) => {
    try {
        const { exercise, code } = req.body;

        const userPrompt = `Exercício: "${exercise}"\n\nCódigo:\n${code}`;
        
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('Chave da API do Gemini não encontrada.');
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

        // O SERVIDOR conversa com a IA
        const geminiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userPrompt }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
                generationConfig: { responseMimeType: "application/json" }
            })
        });

        if (!geminiResponse.ok) {
            throw new Error(`Erro na API do Gemini: ${geminiResponse.statusText}`);
        }

        const geminiData = await geminiResponse.json();
        const responseText = geminiData.candidates[0].content.parts[0].text;
        const result = JSON.parse(responseText);

        // O SERVIDOR envia o resultado formatado de volta para o front-end
        res.json({
            feedbackHtml: converter.makeHtml(result.feedback),
            isCorrect: result.isCorrect
        });

    } catch (error) {
        console.error('Erro no servidor:', error);
        res.status(500).json({ error: 'Falha ao processar a análise no servidor.' });
    }
});

// Inicia o servidor na porta 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
