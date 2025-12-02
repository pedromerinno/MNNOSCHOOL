# 📋 Plano de Reestruturação do Banco de Dados - Sistema de Roles por Empresa

## 🎯 Objetivo

Reestruturar o sistema de roles para permitir que um usuário tenha diferentes roles em empresas diferentes.

**Exemplo:** Um usuário pode ser **admin** na Empresa X, mas **colaborador** na Empresa Y.

---

## 🔍 Situação Atual

### Problemas Identificados:

1. **`cargo_id` em `profiles` (GLOBAL)**
   - Um usuário só pode ter um cargo em todo o sistema
   - Não permite ter cargos diferentes em empresas diferentes

2. **`is_admin` duplicado**
   - Existe em `profiles` (global)
   - Existe em `user_empresa` (por empresa)
   - Gera confusão e inconsistências

3. **`super_admin` em `profiles`**
   - Este está correto (deve ser global)
   - Mantém acesso a tudo independente de empresa

---

## ✅ Nova Estrutura

### Tabela `profiles`
- ✅ **MANTER:** `id`, `display_name`, `email`, `avatar`, etc.
- ✅ **MANTER:** `super_admin` (global - acesso a tudo)
- ❌ **REMOVER:** `is_admin` (não precisa - já existe em `user_empresa`)
- ❌ **REMOVER:** `cargo_id` (mover para `user_empresa`)

### Tabela `user_empresa`
- ✅ **MANTER:** `user_id`, `empresa_id`, `created_at`
- ✅ **MANTER:** `is_admin` (por empresa)
- ✅ **ADICIONAR:** `cargo_id` (por empresa)

### Resultado Final:

```
profiles
├── id (UUID)
├── display_name
├── email
├── avatar
├── super_admin (boolean) ← Global, acesso a tudo
└── ... outros campos pessoais

user_empresa
├── user_id → profiles.id
├── empresa_id → empresas.id
├── is_admin (boolean) ← Por empresa
├── cargo_id (UUID) → job_roles.id ← Por empresa (NOVO)
└── created_at
```

---

## 📝 Plano de Migração

### Fase 1: Preparação (Backup e Validação)

1. ✅ Fazer backup completo do banco
2. ✅ Validar dados existentes
3. ✅ Verificar integridade referencial

### Fase 2: Adicionar Nova Coluna

1. ✅ Adicionar `cargo_id` em `user_empresa`
2. ✅ Criar índice para performance
3. ✅ Adicionar foreign key constraint

### Fase 3: Migração de Dados

1. ✅ Para cada usuário:
   - Pegar `cargo_id` de `profiles`
   - Atualizar TODAS as linhas em `user_empresa` desse usuário com esse `cargo_id`
   - Se usuário não tem cargo, deixar NULL

2. ✅ Validação:
   - Verificar que todos os cargos foram migrados corretamente
   - Verificar que usuários sem cargo têm NULL

### Fase 4: Atualizar Funções SQL

1. ✅ Funções que verificam `is_admin`:
   - Mudar para verificar em `user_empresa` com `empresa_id`
   - Manter fallback para `super_admin` global

2. ✅ Funções que verificam `cargo_id`:
   - Mudar para verificar em `user_empresa` com `empresa_id`
   - Exemplo: `user_can_access_course()` precisa considerar empresa

### Fase 5: Atualizar Políticas RLS

1. ✅ Todas as políticas que usam `profiles.is_admin`:
   - Mudar para `user_empresa.is_admin` com contexto de empresa

2. ✅ Todas as políticas que usam `profiles.cargo_id`:
   - Mudar para `user_empresa.cargo_id` com contexto de empresa

### Fase 6: Remover Colunas Antigas

1. ✅ Remover `cargo_id` de `profiles`
2. ✅ Remover `is_admin` de `profiles`
3. ✅ Remover índices relacionados

### Fase 7: Validação Final

1. ✅ Testar acesso de usuários com diferentes roles
2. ✅ Testar políticas RLS
3. ✅ Verificar performance

---

## 🔧 Funções SQL que Precisam ser Atualizadas

### Funções que verificam `is_admin`:
- `is_admin(user_id uuid)`
- `is_admin()` (sem parâmetro)
- `is_user_admin()`
- `is_user_admin_for_invites()`
- `get_is_admin_secure(user_id uuid)`
- `is_user_admin_or_super_admin()`
- `is_admin_secure(user_id uuid)`

**Nova lógica:** Verificar `user_empresa.is_admin` considerando empresa do contexto.

### Funções que verificam `cargo_id`:
- `user_can_access_course(course_id uuid)`
- `user_can_access_company_document(document_id uuid)`

**Nova lógica:** Verificar `user_empresa.cargo_id` considerando empresa do contexto.

### Funções que mantêm comportamento global:
- `is_super_admin()` - Mantém (é global)
- `get_is_super_admin_secure(user_id uuid)` - Mantém (é global)

---

## ⚠️ Riscos e Mitigações

### Risco 1: Perda de dados durante migração
**Mitigação:** 
- Backup completo antes
- Migração em transação
- Validação após cada passo

### Risco 2: Quebra de funcionalidades existentes
**Mitigação:**
- Testar em ambiente de staging primeiro
- Atualizar código da aplicação simultaneamente
- Manter compatibilidade reversa temporariamente

### Risco 3: Performance degradada
**Mitigação:**
- Adicionar índices apropriados
- Testar queries críticas antes e depois
- Monitorar performance

---

## 🚀 Ordem de Execução

1. **Migração de Dados** (não destrutiva)
   - Adiciona coluna, migra dados
   - Mantém colunas antigas

2. **Atualização de Funções e Políticas** (pode quebrar temporariamente)
   - Atualiza para usar nova estrutura
   - Testa tudo

3. **Limpeza** (destrutiva - só após validação)
   - Remove colunas antigas
   - Remove índices antigos

---

## 📊 Impacto Esperado

### Benefícios:
- ✅ Usuários podem ter roles diferentes por empresa
- ✅ Estrutura mais flexível e escalável
- ✅ Remoção de redundância (`is_admin` duplicado)
- ✅ Melhor organização dos dados

### Desvantagens:
- ⚠️ Requer atualização no código da aplicação
- ⚠️ Queries precisam considerar `empresa_id` sempre
- ⚠️ Mais complexidade nas verificações de permissão

---

## 🔄 Rollback

Se algo der errado, podemos:
1. Manter as duas estruturas (antiga e nova) durante período de transição
2. Reverter funções SQL para usar estrutura antiga
3. Restaurar backup se necessário

---

**Data de Criação:** Janeiro 2025  
**Status:** Aguardando Aprovação

