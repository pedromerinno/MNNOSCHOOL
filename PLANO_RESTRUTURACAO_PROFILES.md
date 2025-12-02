# 📋 Plano Completo de Reestruturação - Tabela `profiles`

## 🎯 Objetivo

Reestruturar a tabela `profiles` para conter **APENAS** informações fixas e globais do usuário, movendo todas as informações relacionadas a empresas para `user_empresa`.

---

## 🔍 Situação Atual

### Tabela `profiles` (ATUAL - INCORRETO)
Contém informações que deveriam estar vinculadas à empresa:
- ❌ `is_admin` - Admin deve ser por empresa, não global
- ❌ `cargo_id` - Cargo deve ser por empresa, não global
- ❌ `aniversario` - Pode variar por empresa? (verificar)
- ❌ `tipo_contrato` - Deve ser por empresa
- ❌ `cidade` - Pode ser global ou por empresa? (verificar)
- ❌ `data_inicio` - Deve ser por empresa
- ❌ `manual_cultura_aceito` - Deve ser por empresa
- ❌ `nivel_colaborador` - Deve ser por empresa

### Tabela `user_empresa` (ATUAL)
Já contém:
- ✅ `user_id` → `profiles.id`
- ✅ `empresa_id` → `empresas.id`
- ✅ `is_admin` (boolean) - Por empresa
- ✅ `cargo_id` (UUID) - Por empresa (já adicionado)
- ✅ `created_at`

---

## ✅ Estrutura Final Desejada

### Tabela `profiles` (FINAL - CORRETO)
**Apenas informações fixas e globais do usuário:**
- ✅ `id` (UUID) - Referência ao `auth.users.id`
- ✅ `display_name` (TEXT) - Nome de exibição
- ✅ `email` (TEXT) - Email do usuário
- ✅ `avatar` (TEXT) - URL do avatar
- ✅ `super_admin` (BOOLEAN) - Acesso global a tudo
- ✅ `primeiro_login` (BOOLEAN) - Flag de primeiro acesso
- ✅ `created_at` (TIMESTAMP)
- ✅ `updated_at` (TIMESTAMP)

**Campos que PODEM ficar (se forem realmente globais):**
- ⚠️ `cidade` - Se for cidade de residência (global), pode ficar
- ⚠️ `aniversario` - Se for data de nascimento (global), pode ficar

**Campos que DEVEM SER REMOVIDOS:**
- ❌ `is_admin` - Já existe em `user_empresa`
- ❌ `cargo_id` - Já existe em `user_empresa`
- ❌ `tipo_contrato` - Deve ser por empresa
- ❌ `data_inicio` - Deve ser por empresa
- ❌ `manual_cultura_aceito` - Deve ser por empresa
- ❌ `nivel_colaborador` - Deve ser por empresa

### Tabela `user_empresa` (FINAL - CORRETO)
**Informações do usuário vinculadas à empresa:**
- ✅ `user_id` → `profiles.id`
- ✅ `empresa_id` → `empresas.id`
- ✅ `is_admin` (BOOLEAN) - Admin desta empresa
- ✅ `cargo_id` (UUID) → `job_roles.id` - Cargo nesta empresa
- ✅ `tipo_contrato` (TEXT) - CLT, PJ ou Fornecedor nesta empresa
- ✅ `data_inicio` (DATE) - Data de início nesta empresa
- ✅ `manual_cultura_aceito` (BOOLEAN) - Aceite do manual desta empresa
- ✅ `nivel_colaborador` (TEXT) - Junior, Pleno ou Senior nesta empresa
- ✅ `created_at` (TIMESTAMP)
- ✅ `updated_at` (TIMESTAMP) - NOVO

---

## 📝 Plano de Migração Detalhado

### FASE 1: Preparação e Análise ✅

1. ✅ Verificar estrutura atual das tabelas
2. ✅ Identificar todas as colunas que precisam ser movidas
3. ✅ Verificar se `cargo_id` já existe em `user_empresa` (já existe)
4. ✅ Verificar dependências (índices, constraints, funções, políticas RLS)

### FASE 2: Adicionar Colunas em `user_empresa` ⏳

**Colunas a adicionar:**
1. `tipo_contrato` (TEXT) - CHECK constraint para valores válidos
2. `data_inicio` (DATE)
3. `manual_cultura_aceito` (BOOLEAN) DEFAULT FALSE
4. `nivel_colaborador` (TEXT) - CHECK constraint para valores válidos
5. `updated_at` (TIMESTAMP) - Para rastreamento

**Índices a criar:**
- Índice em `user_id` + `empresa_id` (já existe?)
- Índice em `cargo_id` (já existe?)

### FASE 3: Migração de Dados ⏳

**Para cada usuário:**
1. Pegar dados de `profiles`:
   - `cargo_id` → Copiar para todas as linhas em `user_empresa` desse usuário
   - `tipo_contrato` → Copiar para todas as linhas em `user_empresa` desse usuário
   - `data_inicio` → Copiar para todas as linhas em `user_empresa` desse usuário
   - `manual_cultura_aceito` → Copiar para todas as linhas em `user_empresa` desse usuário
   - `nivel_colaborador` → Copiar para todas as linhas em `user_empresa` desse usuário

2. **Estratégia de migração:**
   ```sql
   -- Para cada campo, atualizar todas as relações do usuário
   UPDATE user_empresa ue
   SET 
     cargo_id = p.cargo_id,
     tipo_contrato = p.tipo_contrato,
     data_inicio = p.data_inicio,
     manual_cultura_aceito = p.manual_cultura_aceito,
     nivel_colaborador = p.nivel_colaborador
   FROM profiles p
   WHERE ue.user_id = p.id
   AND (p.cargo_id IS NOT NULL OR p.tipo_contrato IS NOT NULL OR ...);
   ```

3. **Validação:**
   - Verificar que todos os dados foram migrados
   - Verificar que usuários sem dados têm NULL corretamente

### FASE 4: Atualizar Funções SQL ⏳

**Funções que precisam ser atualizadas:**
1. Funções que verificam `profiles.is_admin` → `user_empresa.is_admin`
2. Funções que verificam `profiles.cargo_id` → `user_empresa.cargo_id`
3. Funções que verificam `profiles.tipo_contrato` → `user_empresa.tipo_contrato`
4. Funções que verificam `profiles.data_inicio` → `user_empresa.data_inicio`
5. Funções que verificam `profiles.manual_cultura_aceito` → `user_empresa.manual_cultura_aceito`
6. Funções que verificam `profiles.nivel_colaborador` → `user_empresa.nivel_colaborador`

### FASE 5: Atualizar Políticas RLS ⏳

**Políticas que precisam ser atualizadas:**
1. Todas as políticas que usam `profiles.is_admin` → `user_empresa.is_admin`
2. Todas as políticas que usam `profiles.cargo_id` → `user_empresa.cargo_id`
3. Todas as políticas que usam outros campos movidos

### FASE 6: Remover Colunas de `profiles` ⏳

**Ordem de remoção:**
1. Remover índices relacionados
2. Remover foreign key constraints
3. Remover colunas:
   - `is_admin`
   - `cargo_id`
   - `tipo_contrato`
   - `data_inicio`
   - `manual_cultura_aceito`
   - `nivel_colaborador`

### FASE 7: Atualizar Código da Aplicação ⏳

1. Atualizar todos os `.select()` que buscam campos removidos
2. Atualizar todos os `.update()` que atualizam campos removidos
3. Atualizar tipos TypeScript
4. Atualizar hooks e componentes

### FASE 8: Validação Final ⏳

1. Testar criação de usuário
2. Testar vinculação a empresa
3. Testar atualização de dados por empresa
4. Testar políticas RLS
5. Testar funções SQL
6. Verificar performance

---

## 🔧 Decisões a Tomar

### 1. `cidade` e `aniversario` - Ficam ou Vão?

**Análise:**
- `cidade`: Se for cidade de residência do usuário (global), pode ficar em `profiles`
- `aniversario`: Se for data de nascimento (global), pode ficar em `profiles`

**Recomendação:**
- Manter em `profiles` se forem dados pessoais globais
- Mover para `user_empresa` se puderem variar por empresa

### 2. Estratégia de Migração de Dados

**Opção A: Copiar para todas as empresas**
- Se usuário tem `cargo_id = 'X'` em `profiles`
- Copiar para TODAS as linhas em `user_empresa` desse usuário

**Opção B: Copiar apenas para primeira empresa**
- Copiar apenas para a primeira empresa do usuário

**Recomendação:** Opção A (copiar para todas), pois é mais seguro e permite ajuste manual depois.

---

## ⚠️ Riscos e Mitigações

### Risco 1: Perda de dados durante migração
**Mitigação:**
- Fazer backup completo antes
- Executar migração em transação
- Validar dados após cada passo
- Manter colunas antigas até validação completa

### Risco 2: Quebra de funcionalidades
**Mitigação:**
- Atualizar código simultaneamente
- Testar em ambiente de staging
- Manter compatibilidade temporária se necessário

### Risco 3: Performance degradada
**Mitigação:**
- Adicionar índices apropriados
- Testar queries críticas
- Monitorar performance

---

## 🚀 Ordem de Execução Recomendada

1. **FASE 2** - Adicionar colunas em `user_empresa` (não destrutivo)
2. **FASE 3** - Migrar dados (não destrutivo)
3. **FASE 4** - Atualizar funções SQL (pode quebrar temporariamente)
4. **FASE 5** - Atualizar políticas RLS (pode quebrar temporariamente)
5. **FASE 7** - Atualizar código da aplicação (paralelo)
6. **FASE 6** - Remover colunas de `profiles` (destrutivo - só após validação)
7. **FASE 8** - Validação final

---

## 📊 Impacto Esperado

### Benefícios:
- ✅ Estrutura mais clara e organizada
- ✅ Dados por empresa corretamente separados
- ✅ Permite diferentes configurações por empresa
- ✅ Remove redundância e confusão
- ✅ Facilita manutenção futura

### Desvantagens:
- ⚠️ Requer atualização extensiva no código
- ⚠️ Queries precisam considerar `empresa_id` sempre
- ⚠️ Mais complexidade nas verificações de permissão

---

## 🔄 Rollback

Se algo der errado:
1. Manter ambas estruturas durante período de transição
2. Reverter funções SQL para usar estrutura antiga
3. Restaurar backup se necessário
4. Reverter código da aplicação

---

**Data de Criação:** Janeiro 2025  
**Status:** Aguardando Aprovação e Execução

