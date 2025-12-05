# Configuração do Chat com IA

Este projeto inclui um sistema de chat com IA integrado que utiliza a API do OpenAI (ChatGPT) para responder perguntas dos usuários baseadas nas informações da empresa selecionada.

## ⚠️ Segurança Importante

**A chave da OpenAI NUNCA é exposta no front-end.** O sistema usa uma API route serverless no backend (Vercel) que mantém a chave segura no servidor.

## Configuração

### 1. Obter API Key da OpenAI

1. Acesse [OpenAI Platform](https://platform.openai.com/)
2. Faça login ou crie uma conta
3. Vá para a seção "API Keys" no menu
4. Clique em "Create new secret key"
5. Copie a chave gerada (ela só será mostrada uma vez!)

### 2. Configurar Variável de Ambiente

#### Desenvolvimento Local

Adicione a seguinte variável ao seu arquivo `.env` na raiz do projeto:

```env
OPENAI_API_KEY=sk-sua-chave-aqui
```

**⚠️ IMPORTANTE:**
- **NÃO use o prefixo `VITE_`** - isso exporia a chave no front-end
- Use apenas `OPENAI_API_KEY` (sem prefixo)
- Nunca commite o arquivo `.env` no Git
- A chave deve começar com `sk-`
- Mantenha sua chave segura e não a compartilhe

#### Produção (Vercel)

1. Acesse o painel da Vercel: https://vercel.com
2. Vá para o seu projeto
3. Clique em **Settings** → **Environment Variables**
4. Adicione uma nova variável:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: `sk-sua-chave-aqui`
   - **Environment**: Selecione Production, Preview e Development
5. Clique em **Save**
6. Faça um novo deploy para aplicar as mudanças

### 3. Reiniciar o Servidor de Desenvolvimento

Após adicionar a variável de ambiente, reinicie o servidor:

```bash
npm run dev
```

## Como Funciona

### Arquitetura Segura

1. **Front-end**: O `chatService.ts` envia a mensagem para `/api/chat`
2. **Backend (API Route)**: A função serverless em `api/chat.ts`:
   - Recebe a mensagem e dados da empresa
   - Usa a chave `OPENAI_API_KEY` (que está apenas no servidor)
   - Chama a API da OpenAI
   - Retorna a resposta para o front-end
3. **Segurança**: A chave nunca é exposta no código do cliente

### Funcionalidades

O sistema de chat:

1. **Contexto da Empresa**: Quando uma empresa está selecionada, o chat utiliza informações como:
   - Nome da empresa
   - Missão
   - Valores
   - História
   - Frase institucional

2. **Histórico de Conversa**: Mantém as últimas 10 mensagens para contexto contínuo

3. **Modelo Utilizado**: `gpt-4o-mini` (modelo econômico e rápido da OpenAI)

## Exemplos de Perguntas

- "Como utilizar o Asana?"
- "Qual meu processo de integração?"
- "Como converter Figma em PSD?"
- "Quais são os recursos disponíveis?"
- "Como funciona o dashboard?"

## Troubleshooting

### Erro: "API key não configurada"

**Desenvolvimento:**
- Verifique se a variável `OPENAI_API_KEY` (sem prefixo VITE_) está no arquivo `.env`
- Certifique-se de que o servidor foi reiniciado após adicionar a variável
- Verifique se a chave está correta (deve começar com `sk-`)

**Produção:**
- Verifique se a variável `OPENAI_API_KEY` está configurada no painel da Vercel
- Certifique-se de que fez um novo deploy após adicionar a variável
- Verifique se a variável está disponível para o ambiente correto (Production/Preview/Development)

### Erro: "Erro na API: 401"

- A API key está incorreta ou expirada
- Verifique se a chave está ativa na plataforma OpenAI
- Verifique se está usando `OPENAI_API_KEY` e não `VITE_OPENAI_API_KEY`

### Erro: "Erro na API: 429"

- Você excedeu o limite de requisições da sua conta OpenAI
- Verifique seu uso na plataforma OpenAI
- Considere atualizar seu plano se necessário

### Erro: "Method not allowed" ou "404"

- Verifique se a API route está funcionando
- Em desenvolvimento local, certifique-se de que o servidor Vite está rodando
- Em produção, verifique se o arquivo `api/chat.ts` foi deployado corretamente

## Custos

O uso da API da OpenAI é cobrado por uso. O modelo `gpt-4o-mini` é mais econômico:
- Custo aproximado: ~$0.15 por 1M tokens de entrada e ~$0.60 por 1M tokens de saída

Consulte os [preços atuais da OpenAI](https://openai.com/pricing) para informações atualizadas.

## Estrutura de Arquivos

```
.
├── api/
│   └── chat.ts              # API route serverless (backend seguro)
├── src/
│   └── services/
│       └── ai/
│           └── chatService.ts  # Serviço front-end (chama /api/chat)
└── .env.example            # Exemplo de variáveis de ambiente
```
