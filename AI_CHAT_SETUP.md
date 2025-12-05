# Configuração do Chat com IA

Este projeto inclui um sistema de chat com IA integrado que utiliza a API do OpenAI (ChatGPT) para responder perguntas dos usuários baseadas nas informações da empresa selecionada.

## Configuração

### 1. Obter API Key da OpenAI

1. Acesse [OpenAI Platform](https://platform.openai.com/)
2. Faça login ou crie uma conta
3. Vá para a seção "API Keys" no menu
4. Clique em "Create new secret key"
5. Copie a chave gerada (ela só será mostrada uma vez!)

### 2. Configurar Variável de Ambiente

Adicione a seguinte variável ao seu arquivo `.env` na raiz do projeto:

```env
VITE_OPENAI_API_KEY=sk-sua-chave-aqui
```

**Importante:**
- Nunca commite o arquivo `.env` no Git
- A chave deve começar com `sk-`
- Mantenha sua chave segura e não a compartilhe

### 3. Reiniciar o Servidor de Desenvolvimento

Após adicionar a variável de ambiente, reinicie o servidor:

```bash
npm run dev
```

## Como Funciona

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

- Verifique se a variável `VITE_OPENAI_API_KEY` está no arquivo `.env`
- Certifique-se de que o servidor foi reiniciado após adicionar a variável
- Verifique se a chave está correta (deve começar com `sk-`)

### Erro: "Erro na API: 401"

- A API key está incorreta ou expirada
- Verifique se a chave está ativa na plataforma OpenAI

### Erro: "Erro na API: 429"

- Você excedeu o limite de requisições da sua conta OpenAI
- Verifique seu uso na plataforma OpenAI
- Considere atualizar seu plano se necessário

## Custos

O uso da API da OpenAI é cobrado por uso. O modelo `gpt-4o-mini` é mais econômico:
- Custo aproximado: ~$0.15 por 1M tokens de entrada e ~$0.60 por 1M tokens de saída

Consulte os [preços atuais da OpenAI](https://openai.com/pricing) para informações atualizadas.

