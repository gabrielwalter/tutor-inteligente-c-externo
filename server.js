import authRoutes from './server/routes/auth.js';
import progressRoutes from './server/routes/progress.js';
import adminRoutes from './server/routes/admin.js';
import db from './server/db.js';
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

app.use('/auth', authRoutes);
app.use('/api/progress', progressRoutes);
app.use('/admin', adminRoutes);

// Verificar se a API key está configurada
if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY não está configurada!');
    console.error('Configure a variável de ambiente GEMINI_API_KEY');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Função auxiliar para limpar JSON retornado pelo Gemini
function cleanJsonResponse(text) {
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

app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Endpoint para gerar exercícios - MELHORADO
app.post('/api/generate-exercise', async (req, res) => {
    try {
        const { topicName, difficulty = 'normal' } = req.body;
        
        if (!topicName || typeof topicName !== 'string' || topicName.trim().length === 0) {
            return res.status(400).json({ error: 'topicName é obrigatório e deve ser uma string não vazia' });
        }
        
        const validDifficulties = ['easy', 'normal', 'hard'];
        if (!validDifficulties.includes(difficulty)) {
            return res.status(400).json({ error: 'difficulty deve ser: easy, normal ou hard' });
        }

        const difficultyMap = {
            'easy': 'iniciante (conceitos básicos, entrada/saída simples)',
            'normal': 'intermediário (lógica moderada, múltiplas estruturas)',
            'hard': 'avançado (requer raciocínio complexo, otimização)'
        };

        const systemPrompt = `Você é um gerador pedagógico de exercícios de programação em C.

**Objetivo**: Criar um exercício sobre "${topicName}" com nível ${difficultyMap[difficulty]}.

**Diretrizes Pedagógicas**:
1. O enunciado deve ser CLARO e COMPLETO:
   - Especificar exatamente o que deve ser lido (tipo e quantidade de entradas)
   - Especificar exatamente o que deve ser impresso (formato da saída)
   - Incluir exemplos de entrada e saída
   - Mencionar restrições (se houver)

2. O exercício deve FOCAR no tópico solicitado:
   - Para "Estruturas Condicionais": usar if/else, operadores lógicos
   - Para "Loops": exigir while ou for
   - Para "Funções": requerer criação de função(ões)
   - Para "Vetores": trabalhar com arrays
   - Para "Ponteiros": usar passagem por referência ou manipulação de endereços

3. **CRÍTICO - O protótipo deve ser APENAS um ESQUELETO VAZIO:**
   - Incluir SOMENTE: #include <stdio.h>, int main() e return 0
   - Adicionar comentários // TODO: para guiar o aluno
   - NÃO incluir NENHUMA variável declarada
   - NÃO incluir NENHUM scanf, printf, if, for, while ou qualquer lógica
   - Deixar o corpo do main completamente vazio exceto pelos comentários TODO

4. **Estrutura do protótipo:**
   Linha 1: #include <stdio.h>
   Linha 2: (vazia)
   Linha 3: int main() {
   Linha 4: (4 espaços) // TODO: Declare as variáveis necessárias
   Linha 5: (vazia)
   Linha 6: (4 espaços) // TODO: Leia os dados de entrada
   Linha 7: (vazia)
   Linha 8: (4 espaços) // TODO: Processe os dados conforme o enunciado
   Linha 9: (vazia)
   Linha 10: (4 espaços) // TODO: Imprima o resultado
   Linha 11: (vazia)
   Linha 12: (4 espaços) return 0;
   Linha 13: }

Responda APENAS com JSON válido no formato: 
{
  "enunciado": "descrição completa do problema com exemplos",
  "prototipo": "código esqueleto conforme estrutura acima"
}`;

        const userPrompt = `Gere um exercício prático sobre ${topicName} (nível: ${difficulty}).`;
        
        const responseText = await callGemini(systemPrompt, userPrompt, true);
        const cleanedText = cleanJsonResponse(responseText);
        const result = JSON.parse(cleanedText);
        res.json(result);
    } catch (error) {
        console.error('Erro em /api/generate-exercise:', error);
        res.status(500).json({ error: error.message || 'Erro interno do servidor' });
    }
});

// Endpoint para analisar plano LEPEBES - MUITO MELHORADO
app.post('/api/analyze-plan', async (req, res) => {
    try {
        const { exercise, lepeesData } = req.body;
        
        if (!exercise || typeof exercise !== 'string' || exercise.trim().length === 0) {
            return res.status(400).json({ error: 'exercise é obrigatório e deve ser uma string não vazia' });
        }
        
        if (!lepeesData || typeof lepeesData !== 'object') {
            return res.status(400).json({ error: 'lepeesData é obrigatório e deve ser um objeto' });
        }

        const systemPrompt = `Você é um tutor pedagógico especializado em ensinar programação em C usando o método LEPEBES.

**Seu objetivo**: Analisar DETALHADAMENTE cada etapa do planejamento do aluno e identificar se ele está REALMENTE pronto para codificar.

**Análise por Etapa**:

📖 **L - Ler**: 
- Verificar se marcou que leu o problema
- Se NÃO marcou: alertar educadamente

🧠 **E - Entender**: 
- O aluno identificou TODAS as entradas (tipo e quantidade)?
- O aluno identificou TODAS as saídas (o que imprimir e como)?
- O aluno entendeu as regras/restrições do problema?
- Se algo está VAGO ou FALTANDO: indique ESPECIFICAMENTE o que está ausente
- Use perguntas socráticas: "Você identificou quantos números serão lidos?"

📝 **P - Português (pseudocódigo)**:
- O pseudocódigo está em PORTUGUÊS CLARO (não "C disfarçado")?
- Está LINHA POR LINHA (cada passo separado)?
- A lógica faz sentido e resolve o problema?
- Se está confuso: sugira como reescrever SEM dar a resposta pronta

🏗️ **E - Estrutura**:
- O aluno identificou as VARIÁVEIS necessárias e seus TIPOS?
- O aluno indicou quais ESTRUTURAS usar (if/while/for/função)?
- Se algo está faltando: pergunte "Você vai precisar de um contador? De que tipo?"

🎤 **B - Britney Spears**:
- Sempre elogiar por ter chegado até aqui!
- Reforçar que respirar é importante antes de codificar

🦴 **Es - Esqueleto**:
- Tem a estrutura básica (#include <stdio.h>, int main(), return 0)?
- Os nomes das variáveis fazem sentido?
- Está esboçado de forma que ajude na codificação?

**Estilo de Feedback**:
- Use emojis para deixar amigável
- Seja ESPECÍFICO sobre o que falta
- Use PERGUNTAS SOCRÁTICAS em vez de dar respostas prontas
- Elogie o que está BOM antes de apontar melhorias
- Seja encorajador, nunca desencorajador

**Critério para readyToCode**:
- TRUE: Todas as etapas estão completas e bem pensadas
- FALSE: Falta algo essencial ou há confusão conceitual

Responda APENAS com JSON válido no formato: 
{
  "feedback": "análise detalhada em markdown com emojis",
  "readyToCode": boolean
}`;

        const userPrompt = `**Exercício**: "${exercise}"

**Planejamento do aluno (LEPEBES)**:
${JSON.stringify(lepeesData, null, 2)}

Analise detalhadamente cada etapa e dê feedback construtivo.`;

        const responseText = await callGemini(systemPrompt, userPrompt, true);
        const cleanedText = cleanJsonResponse(responseText);
        const result = JSON.parse(cleanedText);
        res.json({ feedbackHtml: converter.makeHtml(result.feedback), readyToCode: result.readyToCode });
    } catch (error) {
        console.error('Erro em /api/analyze-plan:', error);
        res.status(500).json({ error: error.message || 'Erro interno do servidor' });
    }
});

// Endpoint para analisar código - MUITO MELHORADO
app.post('/api/analyze-code', async (req, res) => {
    try {
        const { exercise, code, history } = req.body;
        
        if (!exercise || typeof exercise !== 'string' || exercise.trim().length === 0) {
            return res.status(400).json({ error: 'exercise é obrigatório e deve ser uma string não vazia' });
        }
        
        if (!code || typeof code !== 'string' || code.trim().length === 0) {
            return res.status(400).json({ error: 'code é obrigatório e deve ser uma string não vazia' });
        }
        
        if (!history || !Array.isArray(history)) {
            return res.status(400).json({ error: 'history é obrigatório e deve ser um array' });
        }

        const systemPrompt = `Você é um tutor pedagógico especializado em análise de código C.

**Seu objetivo**: Identificar o TIPO de erro do aluno e dar feedback personalizado baseado nisso.

**Tipos de Erro (identifique qual é)**:

1. 🧠 **Erro Conceitual**: O aluno não entendeu o problema
   - Exemplo: lê a quantidade errada de números, imprime o que não foi pedido
   - Ação: Voltar ao LEPEBES etapa E (Entender)
   
2. 🔀 **Erro Lógico**: O aluno entendeu o problema mas implementou a lógica errada
   - Exemplo: usa for quando deveria usar while, condição do if invertida
   - Ação: Perguntas socráticas sobre a lógica

3. ⚙️ **Erro Sintático**: O aluno sabe a lógica mas errou a sintaxe de C
   - Exemplo: esqueceu ponto-e-vírgula, scanf sem &, printf com formato errado
   - Ação: Corrigir diretamente apontando a sintaxe correta

**Análise do Histórico**:
- Se é uma RESUBMISSÃO: ELOGIE as correções feitas!
- Foque APENAS nos erros que ainda permanecem
- Seja progressivamente mais direto se o aluno estiver travado

**Estilo de Feedback**:
- Use linguagem AMIGÁVEL e ENCORAJADORA
- Destaque o que está CORRETO antes de apontar erros
- Para erros lógicos: faça PERGUNTAS que guiem o aluno
  ❌ "Seu loop está errado"
  ✅ "Observe sua condição do while. Quando i=5, a condição será verdadeira ou falsa? Isso vai executar o bloco?"
- Para erros sintáticos: seja DIRETO
  ✅ "Falta o & antes de 'numero' no scanf. Deve ser: scanf('%d', &numero);"

**Avaliação do Domínio**:
- **REDO**: Erros conceituais graves OU muitos erros lógicos
  - Message: "Vamos revisar o planejamento! Volte ao LEPEBES para reorganizar as ideias."
  
- **REINFORCE**: Erros pontuais mas aluno demonstra entendimento parcial
  - Message: "Você está no caminho certo! Pratique mais com um exercício similar."
  
- **PROCEED**: Código correto ou apenas pequenos detalhes
  - Message: "Excelente! Você dominou este tópico. Pronto para um desafio maior?"

**IMPORTANTE**: 
- Sempre identifique o topicName e topicId baseado no tipo de exercício
- Seja específico sobre qual conceito precisa ser reforçado

Responda APENAS com JSON válido no formato: 
{
  "feedback": "análise detalhada em markdown",
  "assessment": {
    "nextAction": "REDO | REINFORCE | PROCEED",
    "message": "mensagem encorajadora",
    "topicName": "nome do tópico",
    "topicId": "id do tópico (estruturasCondicionais, loops, funcoes, etc)"
  }
}`;

        const userPrompt = `**Contexto da conversa**: ${JSON.stringify(history)}

**Exercício**: "${exercise}"

**Código do aluno (versão atual)**:
\`\`\`c
${code}
\`\`\`

Analise o código identificando o TIPO de erro e dê feedback personalizado.`;

        const responseText = await callGemini(systemPrompt, userPrompt, true);
        const cleanedText = cleanJsonResponse(responseText);
        const result = JSON.parse(cleanedText);
        res.json({ feedbackHtml: converter.makeHtml(result.feedback), assessment: result.assessment });
    } catch (error) {
        console.error('Erro em /api/analyze-code:', error);
        res.status(500).json({ error: error.message || 'Erro interno do servidor' });
    }
});

// Endpoint para chat - MELHORADO
app.post('/api/chat', async (req, res) => {
    try {
        const { history } = req.body;
        
        if (!history || !Array.isArray(history)) {
            return res.status(400).json({ error: 'history é obrigatório e deve ser um array' });
        }

        const systemPrompt = `Você é um tutor amigável respondendo dúvidas sobre programação em C.

**Estilo de resposta**:
- CONCISO mas COMPLETO
- Use EXEMPLOS quando apropriado
- Se o aluno está confuso sobre um conceito, use ANALOGIAS do dia a dia
- Se está perguntando sobre um erro específico, mostre o ANTES e DEPOIS
- Sempre ENCORAJE o aluno

**Evite**:
- Respostas longas demais
- Jargão técnico desnecessário
- Dar código completo sem explicação

**Priorize**:
- Fazer o aluno PENSAR com perguntas
- Dar DICAS em vez de respostas completas
- Explicar o "POR QUÊ" por trás das soluções`;

        const userPrompt = JSON.stringify(history);
        const responseText = await callGemini(systemPrompt, userPrompt, false);
        res.json({ replyHtml: converter.makeHtml(responseText) });
    } catch (error) {
        console.error('Erro em /api/chat:', error);
        res.status(500).json({ error: error.message || 'Erro interno do servidor' });
    }
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log('🚀 ====== TUTOR INTELIGENTE DE C ======');
  console.log(`✅ Servidor rodando na porta: ${PORT}`);
  console.log(`🌱 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🧠 API Key configurada: ${process.env.GEMINI_API_KEY ? 'Sim' : 'Não'}`);
  console.log('🧩 Acesse o navegador para começar a usar!');
  console.log('🎤 Método LEPEBES com Britney Spears ativado!');
  console.log('=========================================');
});

