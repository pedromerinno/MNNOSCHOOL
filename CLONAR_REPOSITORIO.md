# Guia para Clonar Projeto para Novo Repositório GitHub

## Passo 1: Criar o novo repositório no GitHub

1. Acesse https://github.com/new
2. Nome do repositório: **MNNOSCHOOL**
3. Escolha se será público ou privado
4. **NÃO** inicialize com README, .gitignore ou licença (já temos esses arquivos)
5. Clique em "Create repository"

## Passo 2: Atualizar o remote do Git

Após criar o repositório, execute os seguintes comandos no terminal:

```bash
# Remover o remote atual
git remote remove origin

# Adicionar o novo remote (substitua SEU_USUARIO pelo seu username do GitHub)
git remote add origin https://github.com/SEU_USUARIO/MNNOSCHOOL.git

# Verificar se foi adicionado corretamente
git remote -v
```

## Passo 3: Fazer push para o novo repositório

```bash
# Fazer push de todos os branches
git push -u origin main

# Se você tiver outros branches, faça push deles também:
# git push -u origin nome-do-branch
```

## Passo 4: Verificar

1. Acesse o novo repositório no GitHub
2. Verifique se todos os arquivos foram enviados corretamente

## Observações Importantes

- **Arquivo .env**: Certifique-se de que o arquivo `.env` está no `.gitignore` (já está configurado)
- **Variáveis de ambiente**: Você precisará configurar as variáveis de ambiente no novo ambiente (Vercel, Supabase, etc.)
- **Supabase**: Se estiver usando Supabase, você pode precisar atualizar as configurações de projeto
- **Vercel**: Se estiver usando Vercel, você precisará conectar o novo repositório

## Sobre MCP (Model Context Protocol)

**Não é necessário acesso MCP** para este projeto. O projeto não possui configurações MCP e funciona normalmente sem ele.



