# Como Aplicar as Migrações do Sistema de Conversas de IA

## Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **SQL Editor** no menu lateral
4. Clique em **New Query**
5. Copie e cole o conteúdo do arquivo `supabase/migrations/APPLY_ALL_AI_CONVERSATIONS_MIGRATIONS.sql`
6. Clique em **Run** ou pressione `Ctrl+Enter` (Windows/Linux) ou `Cmd+Enter` (Mac)
7. Verifique se não há erros na execução

## Opção 2: Via Supabase CLI

Se você tiver o Supabase CLI instalado:

```bash
# Instalar Supabase CLI (se não tiver)
npm install -g supabase

# Fazer login
supabase login

# Linkar ao projeto
supabase link --project-ref seu-project-ref

# Aplicar migrações
supabase db push
```

## Opção 3: Aplicar Migrações Individuais

Se preferir aplicar uma por uma, execute na seguinte ordem:

1. `20250215000000_create_ai_conversations.sql` - Cria as tabelas e estrutura básica
2. `20250215000001_fix_ai_conversation_trigger.sql` - Corrige a função do trigger
3. `20250215000002_fix_ai_conversations_rls_policies.sql` - Corrige as políticas RLS

## Verificação Pós-Migração

Após aplicar as migrações, verifique se tudo está correto:

```sql
-- Verificar se as tabelas foram criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('ai_conversations', 'ai_messages');

-- Verificar se as políticas RLS foram criadas
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('ai_conversations', 'ai_messages');

-- Verificar se a função do trigger existe
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'update_ai_conversation_updated_at';
```

## Troubleshooting

### Erro: "relation already exists"
- As tabelas já existem. Isso é normal se você já executou a migração antes.
- O script usa `CREATE TABLE IF NOT EXISTS`, então é seguro executar novamente.

### Erro: "policy already exists"
- As políticas já existem. O script usa `DROP POLICY IF EXISTS` antes de criar, então é seguro executar novamente.

### Erro de permissão
- Certifique-se de estar usando uma conta com permissões de administrador no Supabase
- Verifique se você está no projeto correto

## Arquivos de Migração

- `APPLY_ALL_AI_CONVERSATIONS_MIGRATIONS.sql` - **Use este arquivo** para aplicar tudo de uma vez
- `20250215000000_create_ai_conversations.sql` - Migração inicial
- `20250215000001_fix_ai_conversation_trigger.sql` - Correção do trigger
- `20250215000002_fix_ai_conversations_rls_policies.sql` - Correção das políticas RLS

