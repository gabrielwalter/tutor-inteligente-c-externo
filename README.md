# 🎓 Tutor Inteligente de C

Um sistema inteligente de tutoria para aprendizado de programação em C, desenvolvido com IA (Google Gemini) e integrando o método LEPEBES para resolução de problemas.

## 🚀 Funcionalidades

- **Geração de Exercícios Personalizados**: Cria exercícios baseados em tópicos específicos de C
- **Método LEPEBES Integrado**: Sistema de planejamento estruturado (Ler, Entender, Português, Estruturas, Britney Spears, Esqueleto)
- **Análise de Código com IA**: Feedback inteligente sobre o código do estudante
- **Chat Interativo**: Conversa sobre feedback e dúvidas
- **Sistema de Progresso**: Acompanhamento do aprendizado por tópicos
- **Interface Moderna**: Design responsivo e intuitivo

## 🛠️ Tecnologias Utilizadas

- **Backend**: Node.js + Express
- **IA**: Google Gemini 2.5 Flash
- **Frontend**: HTML5 + CSS3 + JavaScript (Vanilla)
- **Estilização**: Tailwind CSS
- **Markdown**: Showdown.js
- **Deploy**: Render

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
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

### 1. Geração de Exercícios
- Vá para a aba **"Trilha"**
- Escolha um tópico de programação
- Clique em **"Praticar"** para gerar um exercício personalizado

### 2. Método LEPEBES
- Na aba **"Prática"**, preencha cada etapa do LEPEBES:
  - **L**: Ler o problema
  - **E**: Entender entradas, saídas e regras
  - **P**: Português (pseudocódigo)
  - **E**: Estruturas (variáveis, if, loop, função)
  - **B**: Britney Spears (respirar fundo e se acalmar)
  - **Es**: Esqueleto (código em C)

### 3. Análise de Código
- Após planejar com LEPEBES, escreva seu código
- Clique em **"Analisar Código"** para receber feedback da IA
- Use o chat para esclarecer dúvidas sobre o feedback

## 📁 Estrutura do Projeto

```
tutor-inteligente-c/
├── public/
│   └── index.html          # Interface principal
├── server.js               # Servidor Express
├── package.json            # Dependências e scripts
├── .env.example           # Exemplo de configuração
├── .gitignore             # Arquivos ignorados pelo Git
└── README.md              # Este arquivo
```

## 🚀 Deploy no Render

1. **Conecte seu repositório GitHub ao Render**
2. **Configure as variáveis de ambiente:**
   - `GEMINI_API_KEY`: Sua chave da API do Gemini
   - `NODE_ENV`: production
3. **Deploy automático** a cada push no GitHub

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

**Gabriel Hando** - [@gabrielhando](https://github.com/gabrielhando)

---

## 🎓 Método LEPEBES

O método LEPEBES é uma abordagem estruturada para resolução de problemas de programação:

- **L** - **Ler**: Leia cuidadosamente o enunciado
- **E** - **Entender**: Identifique entradas, saídas e regras
- **P** - **Português**: Escreva o algoritmo em português
- **E** - **Estruturas**: Defina variáveis, estruturas condicionais e loops
- **B** - **Britney Spears**: Respire fundo e se acalme (como Britney nos ensinou)
- **Es** - **Esqueleto**: Implemente o código em C

Este método ajuda estudantes a desenvolver uma abordagem sistemática para resolver problemas de programação.

---

⭐ **Se este projeto te ajudou, não esqueça de dar uma estrela!** ⭐
