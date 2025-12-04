# Correção: Erro ao Criar Documento da Empresa

## Problema Identificado

O erro ao criar documentos da empresa estava sendo causado por:

1. **Política RLS incorreta**: A política de INSERT usava `NEW.company_id` que não funciona em cláusulas `WITH CHECK` do PostgreSQL
2. **Falta de validação**: Não havia validação adequada dos dados antes da inserção
3. **Logs insuficientes**: Difícil diagnosticar o problema exato

## Correções Implementadas

### 1. Migração SQL - Política RLS Corrigida
**Arquivo**: `supabase/migrations/20251208000000_fix_company_documents_insert_rls_final.sql`

- Remove todas as políticas conflitantes
- Cria uma política única e correta que:
  - Permite super admins inserirem documentos para qualquer empresa
  - Permite admins da empresa inserirem documentos para sua própria empresa
  - Usa `company_documents.company_id` diretamente (não `NEW.company_id`)

### 2. Validação de Permissões
**Arquivo**: `src/hooks/company-documents/useCompanyDocuments.ts`

- Verifica permissões antes de tentar inserir
- Valida se o usuário é admin da empresa ou super admin
- Mensagens de erro claras e específicas

### 3. Validação de Dados
- Valida todos os campos obrigatórios
- Garante que `attachment_type` seja 'file' ou 'link'
- Valida que arquivo ou link estejam presentes conforme o tipo

### 4. Logs Detalhados
- Logs completos para diagnóstico
- Informações sobre permissões, dados enviados e erros
- Facilita identificar problemas futuros

## Como Aplicar

### Passo 1: Aplicar a Migração

```bash
# Se estiver usando Supabase CLI localmente
supabase db reset

# Ou aplicar apenas as novas migrações
supabase migration up
```

### Passo 2: Verificar se a Política foi Aplicada

Execute o script de diagnóstico:

```sql
-- Executar no Supabase SQL Editor
SELECT 
  policyname,
  cmd as operation,
  with_check as with_check_clause
FROM pg_policies
WHERE tablename = 'company_documents'
AND cmd = 'INSERT';
```

Você deve ver uma política chamada `company_documents_insert` com a cláusula `WITH CHECK` correta.

### Passo 3: Testar

1. **Como Super Admin**: Deve funcionar para qualquer empresa
2. **Como Admin da Empresa**: Deve funcionar apenas para a própria empresa
3. **Como Usuário Comum**: Deve mostrar mensagem de erro clara

## Verificação de Erros

Se ainda houver problemas, verifique:

1. **Console do Navegador**: Procure por logs começando com `[CompanyDocuments]`
2. **Network Tab**: Verifique a resposta da requisição de INSERT
3. **Supabase Logs**: Verifique os logs do banco de dados

## Estrutura Esperada da Política RLS

A política deve ter esta estrutura:

```sql
CREATE POLICY "company_documents_insert"
ON public.company_documents
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND super_admin = true
  ) OR 
  EXISTS (
    SELECT 1 FROM public.user_empresa 
    WHERE user_id = auth.uid() 
    AND empresa_id = company_documents.company_id 
    AND is_admin = true
  )
);
```

## Campos Obrigatórios

- `company_id`: UUID da empresa (NOT NULL)
- `name`: Nome do documento (NOT NULL)
- `document_type`: Tipo do documento (NOT NULL)
- `attachment_type`: 'file' ou 'link' (NOT NULL, DEFAULT 'file')
- `created_by`: UUID do usuário criador (NOT NULL)

## Campos Opcionais

- `file_path`: Caminho do arquivo (NULL se for link)
- `file_type`: Tipo MIME do arquivo (NULL se for link)
- `thumbnail_path`: Caminho do thumbnail (NULL)
- `description`: Descrição do documento (NULL)
- `link_url`: URL do link (NULL se for arquivo)

## Suporte

Se o problema persistir após aplicar as correções:

1. Verifique os logs no console do navegador
2. Execute o script de diagnóstico SQL
3. Verifique se o usuário tem `is_admin = true` na tabela `user_empresa` para a empresa selecionada


