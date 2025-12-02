# 📊 Status da Reestruturação do Banco de Dados

## ✅ O que já foi feito

### FASE 2: Adicionar Colunas em `user_empresa` ✅
- ✅ `tipo_contrato` (TEXT) - Adicionado com CHECK constraint
- ✅ `data_inicio` (DATE) - Adicionado
- ✅ `manual_cultura_aceito` (BOOLEAN) - Adicionado com DEFAULT FALSE
- ✅ `nivel_colaborador` (TEXT) - Adicionado com CHECK constraint
- ✅ `updated_at` (TIMESTAMP) - Adicionado

### FASE 3: Função Helper ✅
- ✅ `is_user_admin_for_company()` - Criada
- ✅ `is_current_user_admin_for_company()` - Criada

---

## ⏳ O que ainda precisa ser feito

### FASE 4: Atualizar Políticas RLS ⚠️ CRÍTICO

**Problema:** Existem **muitas** políticas RLS (40+) que ainda dependem de `profiles.is_admin`.

**Exemplos de políticas que precisam ser atualizadas:**
- `Administrators can manage all access data` (company_access)
- `Admins can create company access` (company_access)
- `Admins can delete company access` (company_access)
- `Admins can update company access` (company_access)
- `Users can view company access if related to company` (company_access)
- E muitas outras em diferentes tabelas...

**Estratégia de atualização:**
1. Substituir `profiles.is_admin = true` por `is_current_user_admin_for_company(company_id)`
2. Para políticas sem contexto de empresa, usar `is_current_user_admin_for_company(NULL)`
3. Manter verificação de `super_admin` em `profiles`

**Exemplo de atualização:**
```sql
-- ANTES
CREATE POLICY "Admins can create company access"
ON company_access FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_admin = true)
);

-- DEPOIS
CREATE POLICY "Admins can create company access"
ON company_access FOR INSERT
WITH CHECK (
  is_current_user_admin_for_company(company_id)
);
```

### FASE 5: Migração de Dados ⚠️

**Problema:** A migração falhou porque há validação de cargo por empresa.

**Solução:** Migrar apenas quando o cargo pertence à empresa:
```sql
UPDATE user_empresa ue
SET 
  cargo_id = p.cargo_id,
  tipo_contrato = p.tipo_contrato,
  data_inicio = p.data_inicio,
  manual_cultura_aceito = COALESCE(p.manual_cultura_aceito, false),
  nivel_colaborador = p.nivel_colaborador,
  updated_at = now()
FROM profiles p
LEFT JOIN job_roles jr ON jr.id = p.cargo_id
WHERE ue.user_id = p.id
AND (
  -- Se cargo existe, verificar se pertence à empresa
  (p.cargo_id IS NULL OR jr.company_id = ue.empresa_id)
  -- Ou migrar outros campos mesmo sem cargo válido
  OR p.tipo_contrato IS NOT NULL
  OR p.data_inicio IS NOT NULL
  OR p.nivel_colaborador IS NOT NULL
);
```

### FASE 6: Remover Colunas de `profiles` ⚠️

**Só pode ser feito após:**
1. ✅ Todas as políticas RLS atualizadas
2. ✅ Dados migrados com sucesso
3. ✅ Código da aplicação atualizado
4. ✅ Testes completos

**Colunas a remover:**
- `is_admin`
- `cargo_id`
- `tipo_contrato`
- `data_inicio`
- `manual_cultura_aceito`
- `nivel_colaborador`

---

## 🎯 Próximos Passos Recomendados

### Opção 1: Atualização Gradual (Recomendado)
1. Atualizar políticas RLS uma tabela por vez
2. Testar cada atualização
3. Migrar dados gradualmente
4. Remover colunas apenas no final

### Opção 2: Atualização Completa
1. Criar script para atualizar todas as políticas de uma vez
2. Executar migração de dados ajustada
3. Testar tudo
4. Remover colunas

---

## 📋 Checklist de Validação

Antes de remover as colunas, verificar:
- [ ] Todas as políticas RLS atualizadas
- [ ] Dados migrados corretamente
- [ ] Funções SQL atualizadas
- [ ] Código da aplicação atualizado
- [ ] Testes de acesso funcionando
- [ ] Testes de permissões funcionando
- [ ] Performance aceitável

---

## ⚠️ Avisos Importantes

1. **NÃO remover as colunas de `profiles` até que todas as políticas RLS sejam atualizadas**
2. **A migração de dados precisa considerar validação de cargo por empresa**
3. **Manter backup antes de qualquer operação destrutiva**
4. **Testar em ambiente de staging primeiro**

---

**Última Atualização:** Janeiro 2025  
**Status:** Em Progresso - Fase 4 (Atualização de Políticas RLS)

