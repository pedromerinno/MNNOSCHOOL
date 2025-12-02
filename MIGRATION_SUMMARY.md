# 📋 Resumo das Migrações - Sistema de Roles por Empresa

## 🎯 Objetivo Concluído

Reestruturação do banco de dados para permitir que usuários tenham **roles diferentes por empresa**.

**Exemplo:** Um usuário pode ser **admin** na Empresa X, mas **colaborador** na Empresa Y.

---

## ✅ Migrações Criadas

### 1. `20250125000001_add_cargo_id_to_user_empresa.sql`
**Status:** ✅ Pronto para executar

**O que faz:**
- Adiciona coluna `cargo_id` na tabela `user_empresa`
- Migra dados existentes de `profiles.cargo_id` para `user_empresa.cargo_id`
- Valida que cada cargo pertence à empresa correta
- Adiciona índices para performance
- Adiciona foreign key constraint

**Risco:** 🟢 BAIXO - Não remove dados, apenas adiciona estrutura

---

### 2. `20250125000002_add_company_role_functions.sql`
**Status:** ✅ Pronto para executar

**O que faz:**
- Cria funções helper para verificar roles por empresa:
  - `is_user_admin_for_company(user_id, company_id)`
  - `is_admin_for_company(company_id)`
  - `get_user_job_role_for_company(user_id, company_id)`
  - `user_belongs_to_company(user_id, company_id)`
  - `is_user_admin_or_super_admin_for_company(company_id)`
- Cria trigger para validar que `cargo_id` pertence à empresa

**Risco:** 🟢 BAIXO - Apenas adiciona funções

---

### 3. `20250125000003_update_access_functions.sql`
**Status:** ✅ Pronto para executar

**O que faz:**
- Atualiza `user_can_access_course()` para usar `user_empresa.cargo_id`
- Atualiza `user_can_access_company_document()` para usar `user_empresa.cargo_id`
- Atualiza funções `is_admin()` para aceitar empresa como parâmetro opcional
- Mantém compatibilidade com código existente (sem quebrar)

**Risco:** 🟡 MÉDIO - Pode afetar lógica de acesso, mas mantém compatibilidade

---

### 4. `20250125000004_prepare_column_removal.sql`
**Status:** ⚠️ Preparação - NÃO executa remoção ainda

**O que faz:**
- Documenta como remover colunas antigas no futuro
- Marca colunas `profiles.cargo_id` e `profiles.is_admin` como DEPRECATED
- **NÃO remove** as colunas ainda (só após atualizar código da aplicação)

**Risco:** 🟢 BAIXO - Apenas documenta, não remove nada

---

## 📊 Nova Estrutura

### Antes:
```sql
profiles
├── id
├── is_admin (global) ❌
├── super_admin (global) ✅
└── cargo_id (global) ❌

user_empresa
├── user_id
├── empresa_id
└── is_admin (por empresa) ✅
```

### Depois:
```sql
profiles
├── id
└── super_admin (global) ✅

user_empresa
├── user_id
├── empresa_id
├── is_admin (por empresa) ✅
└── cargo_id (por empresa) ✅ NOVO!
```

---

## 🚀 Próximos Passos

### 1. Executar Migrações no Banco
```bash
# Aplicar migrações na ordem:
supabase migration up
```

### 2. Atualizar Código da Aplicação

Você precisa atualizar o código que:
- ❌ Usa `profiles.cargo_id` → ✅ Usar `user_empresa.cargo_id` (por empresa)
- ❌ Usa `profiles.is_admin` → ✅ Usar `user_empresa.is_admin` (por empresa)
- ✅ Mantém `profiles.super_admin` (global, não muda)

**Arquivos que provavelmente precisam ser atualizados:**
- `src/components/admin/UserRoleAssignment.tsx`
- `src/hooks/collaborator/useFetchCompanyUsers.ts`
- `src/hooks/company-documents/useCompanyUsers.ts`
- `src/pages/Integration.tsx`
- Qualquer outro código que acesse `cargo_id` ou `is_admin`

### 3. Testar Tudo

- [ ] Usuário pode ter cargo em uma empresa e não ter em outra
- [ ] Usuário pode ser admin em uma empresa e não em outra
- [ ] Super admin funciona globalmente
- [ ] Acesso a cursos considera cargo por empresa
- [ ] Acesso a documentos considera cargo por empresa

### 4. Após Tudo Testado

Quando o código da aplicação estiver atualizado e testado, você pode:

1. Executar a remoção das colunas antigas (descomentar em `20250125000004_prepare_column_removal.sql`)
2. Ou criar uma nova migração final para remover as colunas

---

## ⚠️ Importante

1. **Faça backup** antes de executar as migrações
2. **Teste em staging** primeiro
3. **Atualize o código** antes de remover colunas antigas
4. **Mantenha compatibilidade** durante período de transição

---

## 🔧 Funções Disponíveis

### Verificar se usuário é admin de uma empresa:
```sql
SELECT is_admin_for_company('empresa-id-aqui');
SELECT is_user_admin_for_company('user-id-aqui', 'empresa-id-aqui');
```

### Obter cargo do usuário em uma empresa:
```sql
SELECT get_user_job_role_for_company('user-id-aqui', 'empresa-id-aqui');
```

### Verificar acesso:
```sql
SELECT user_can_access_course('course-id-aqui');
SELECT user_can_access_company_document('document-id-aqui');
```

---

## 📝 Notas Técnicas

- Todas as funções mantêm compatibilidade reversa
- Super admin continua funcionando globalmente
- Índices foram otimizados para queries por empresa
- Trigger valida integridade de cargo_id automaticamente

---

**Data:** Janeiro 2025  
**Status:** ✅ Migrações prontas - Aguardando execução e atualização de código

