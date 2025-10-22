# 🎓 Tutor Inteligente de C

Um sistema inteligente de tutoria para aprendizado de programação em C, desenvolvido com IA pedagógica (Google Gemini) e integrando o método LEPEBES para resolução estruturada de problemas.

## 🚀 Funcionalidades

### 🎯 Núcleo Pedagógico
- **Método LEPEBES Completo**: Sistema estruturado em 6 etapas (Ler, Entender, Português, Estruturas, Britney Spears, Esqueleto)
- **Exemplo Interativo**: Tutorial passo a passo mostrando como aplicar o método LEPEBES na prática
- **IA Pedagógica Avançada**: Identifica o TIPO de erro do aluno (conceitual, lógico ou sintático) e personaliza o feedback

### 🤖 Análise Inteligente
- **Análise de Planejamento**: Verifica se o aluno entendeu o problema antes de codificar
- **Análise de Código**: Feedback detalhado com perguntas socráticas para guiar o aprendizado
- **Chat Contextual**: Conversa sobre dúvidas mantendo histórico da conversa
- **Progressão Adaptativa**: Sistema REDO/REINFORCE/PROCEED baseado no domínio demonstrado

### 📊 Acompanhamento
- **Sistema de Progresso**: Tracking visual por tópico (0-100%)
- **Geração Personalizada**: Exercícios adaptados ao nível e necessidade
- **Trilha de Estudos**: Organização por urgência (P1 e P2)

## 🛠️ Tecnologias Utilizadas

- **Backend**: Node.js + Express
- **IA**: Google Gemini 2.5 Flash (com prompts pedagógicos otimizados)
- **Frontend**: HTML5 + CSS3 + JavaScript (Vanilla)
- **Estilização**: Tailwind CSS
- **Markdown**: Showdown.js
- **Deploy**: Render

## 📋 Pré-requisitos

- Node.js (versão 18 ou superior)
- NPM ou Yarn
- Chave de API do Google Gemini

## 🔧 Instalação

1. **Clone o repositório:**
```bash
git clone https://github.com/seu-usuario/tutor-inteligente-c.git
cd tutor-inteligente-c
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
```bash
# Crie um arquivo .env na raiz do projeto
echo "GEMINI_API_KEY=sua_chave_aqui" > .env
```

4. **Execute o servidor:**
```bash
npm start
```

5. **Acesse a aplicação:**
```
http://localhost:3000
```

## 🔑 Configuração da API Key

1. Acesse [Google AI Studio](https://aistudio.google.com/)
2. Faça login com sua conta Google
3. Crie uma nova API Key
4. Adicione a chave no arquivo `.env`:
```
GEMINI_API_KEY=AIzaSyAquiVaiSuaChaveCompleta123456789
```

## 🎯 Como Usar

### 1. Aprenda o Método (Aba "Exemplo LEPEBES")
- Veja um problema sendo resolvido passo a passo
- Entenda como aplicar cada etapa do LEPEBES
- Use as dicas pedagógicas para fixar o conceito

### 2. Gere Exercícios (Aba "Trilha")
- Escolha um tópico de programação
- Clique em **"Praticar"** para gerar um exercício personalizado
- Exercícios são adaptados ao seu nível

### 3. Use o Método LEPEBES (Aba "Prática")
- **L (Ler)**: Marque que leu o problema
- **E (Entender)**: Liste entradas, saídas e regras
- **P (Português)**: Escreva o algoritmo em pseudocódigo linha por linha
- **E (Estrutura)**: Defina variáveis (com tipos) e estruturas (if/for/while)
- **B (Britney Spears)**: Britney Spears.
- **Es (Esqueleto)**: Escreva o código em C

### 4. Analise Seu Plano
- Clique em **"Analisar Plano"** antes de codificar
- A IA verifica se você está pronto para codificar
- Receba feedback específico sobre o que melhorar

### 5. Analise Seu Código
- Escreva o código baseado no seu planejamento
- Clique em **"Analisar Código"**
- A IA identifica:
  - 🧠 **Erro Conceitual**: Você não entendeu o problema
  - 🔀 **Erro Lógico**: Implementação incorreta (recebe perguntas socráticas)
  - ⚙️ **Erro Sintático**: Correção direta da sintaxe

### 6. Converse e Tire Dúvidas
- Use o chat para esclarecer dúvidas sobre o feedback
- A IA mantém contexto da conversa
- Receba explicações didáticas e exemplos

### 7. Acompanhe seu Progresso (Aba "Progresso")
- Visualize seu domínio de cada tópico (0-100%)
- Identifique pontos fracos
- Celebre suas conquistas! 🎉

## 📁 Estrutura do Projeto

```
tutor-inteligente-c/
├── public/
│   ├── index.html          # Interface principal (ATUALIZADA)
│   └── desespero.html      # Página motivacional
├── server.js               # Servidor Express (ATUALIZADO)
├── package.json            # Dependências
├── .env.example           # Exemplo de configuração
├── .gitignore             # Arquivos ignorados
└── README.md              # Este arquivo
```

## 🎓 O Método LEPEBES

O método LEPEBES é uma abordagem estruturada para resolução de problemas de programação:

### 📖 **L - Ler**
Leia cuidadosamente TODO o enunciado. Não pule partes!

### 🧠 **E - Entender**
Identifique claramente:
- **Entradas**: O que o programa vai ler? (tipo e quantidade)
- **Saídas**: O que o programa vai imprimir? (formato)
- **Regras**: Quais são as restrições e condições?

### 📝 **P - Português (Pseudocódigo)**
Escreva o algoritmo em **PORTUGUÊS PURO**, linha por linha:
- ❌ Evite: "se numero mod 2 igual 0" (C disfarçado)
- ✅ Use: "Se o número é divisível por 2"

### 🏗️ **E - Estrutura**
Defina ANTES de codificar:
- **Variáveis**: Nome e TIPO (`int`, `float`, `char`)
- **Estruturas**: Quais usar? (`if`, `for`, `while`, `função`)
- **Operadores**: Quais necessários? (`%`, `&&`, `||`)

### 🎤 **B - Britney Spears**
Respire fundo! 🎵 *"...Baby One More Time"* 🎵

Você planejou tudo. Agora é só transformar em código.

💜 Lembre-se: Todo programador comete erros. O importante é o PROCESSO de raciocínio!

### 🦴 **Es - Esqueleto (Código em C)**
Traduza seu planejamento para C:
- Use nomes de variáveis descritivos
- Siga a estrutura que você definiu
- Teste com os exemplos do enunciado

## 🤖 Como a IA Ajuda

### Análise de Planejamento
A IA verifica cada etapa do LEPEBES:
```
✅ Identificou todas as entradas?
✅ Sabe exatamente o que imprimir?
✅ Pseudocódigo está em português claro?
✅ Definiu tipos das variáveis?
```

### Análise de Código (Feedback Personalizado)

**Tipo 1: Erro Conceitual** 🧠
- O aluno não entendeu o problema
- **Ação**: Volta ao LEPEBES (etapa E - Entender)
- **Feedback**: "Vamos revisar o planejamento!"

**Tipo 2: Erro Lógico** 🔀
- O aluno entendeu mas implementou errado
- **Ação**: Perguntas socráticas
- **Feedback**: "Observe sua condição do while. Quando i=5, ela será verdadeira ou falsa?"

**Tipo 3: Erro Sintático** ⚙️
- O aluno sabe a lógica mas errou a sintaxe
- **Ação**: Correção direta
- **Feedback**: "Falta o & antes de 'numero' no scanf. Deve ser: `scanf("%d", &numero);`"

### Sistema de Progressão

**REDO** 🔴
- Erros conceituais graves
- Volta ao planejamento

**REINFORCE** 🟡
- Erros pontuais
- Pratica exercício similar

**PROCEED** 🟢
- Código correto!
- Avança para nível maior

## 🚀 Deploy no Render

### Configuração Automática

1. **Conecte seu repositório GitHub ao Render**
2. **Configure as variáveis de ambiente:**
   - `GEMINI_API_KEY`: Sua chave da API do Gemini
   - `NODE_ENV`: production
3. **Deploy automático** a cada push no GitHub

### Health Check
O servidor inclui endpoint `/health` para monitoramento:
```bash
curl https://seu-app.onrender.com/health
```

## 🧪 Testando Localmente

```bash
# Instalar dependências
npm install

# Configurar .env
echo "GEMINI_API_KEY=sua_chave" > .env

# Executar servidor
npm start

# Acessar no navegador
http://localhost:3000
```

## 🔧 Ambiente de Desenvolvimento

### Google Colab (Recomendado)
- Compile e teste códigos C diretamente no navegador
- Use `!gcc arquivo.c -o programa && ./programa` nas células
- Acesse: [colab.research.google.com](https://colab.research.google.com/)

### Local
- GCC: `sudo apt install gcc` (Linux) ou MinGW (Windows)
- IDE: VS Code com extensão C/C++

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Áreas para Contribuir
- 🎨 Melhorias na UI/UX
- 🤖 Otimização dos prompts pedagógicos
- 📚 Novos exemplos LEPEBES
- 🧪 Testes automatizados
- 🌐 Internacionalização

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

**Gabriel Hando** - [@gabrielhando](https://github.com/gabrielhando)

## 🙏 Agradecimentos

- **Google Gemini**: Pela API de IA generativa
- **Britney Spears**: Por inspirar o "B" do método (respire fundo!) 🎤💜
- **Comunidade**: Por feedback e sugestões de melhoria

## 📊 Changelog

### v2.0.0 (Atual)
✨ **Novidades Pedagógicas:**
- Exemplo LEPEBES interativo com tutorial passo a passo
- IA identifica tipo de erro (conceitual/lógico/sintático)
- Feedback personalizado com perguntas socráticas
- Prompts pedagógicos otimizados

🔧 **Melhorias Técnicas:**
- Análise de planejamento mais rigorosa
- Validação detalhada de cada etapa do LEPEBES
- Sistema de progressão mais inteligente (REDO/REINFORCE/PROCEED)
- Interface modernizada com gradientes

### v1.0.0
- Lançamento inicial
- Método LEPEBES básico
- Geração de exercícios
- Análise de código

## 🐛 Problemas Conhecidos

- Autoplay do vídeo pode ser bloqueado por alguns navegadores (mostra poster da Britney)
- Timeout em exercícios muito complexos (limite de 45s)

## 💡 Dicas de Uso

1. **Sempre preencha o LEPEBES completo** antes de codificar
2. **Use o exemplo interativo** se for sua primeira vez
3. **Analise o plano** antes de escrever código
4. **Leia o feedback com atenção** - a IA faz perguntas para te guiar
5. **Use o chat** para esclarecer dúvidas específicas
6. **Compile e teste** no Google Colab

## 📚 Recursos Adicionais

- [Documentação C](https://devdocs.io/c/)
- [Tutorial C (W3Schools)](https://www.w3schools.com/c/)
- [Exercícios C (URI Online Judge)](https://www.beecrowd.com.br/)

## 🎯 Roadmap Futuro

- [ ] Suporte a múltiplas linguagens (Python, Java)
- [ ] Sistema de gamificação com badges
- [ ] Desafios diários
- [ ] Modo competitivo (ranking)
- [ ] Integração com GitHub para salvar códigos
- [ ] App mobile
- [ ] Modo offline

---

## 🎤 Por que "Britney Spears" no método?

A letra **B** (Britney Spears) representa o momento crucial de **respirar fundo e se acalmar** antes de codificar. Assim como Britney nos ensinou a ter resiliência, o método LEPEBES te ensina que o importante não é acertar de primeira, mas ter um PROCESSO estruturado de raciocínio.

💜 **"It's Britney, b*tch!"** - e agora é você quem vai arrasar na programação! 💜

---

⭐ **Se este projeto te ajudou, não esqueça de dar uma estrela!** ⭐

**#LEPEBES #BritneySpearsCanHelp #ProgramaçãoComMétodo** 🎓💻🎤
