# 🚀 Plano de Execução - Reestruturação do Banco de Dados

## ⚠️ Problemas Identificados

### 1. Validação de Cargo por Empresa
- Existe uma função `validate_user_empresa_cargo()` que valida se o cargo pertence à empresa
- Durante a migração, estamos tentando copiar `cargo_id` de `profiles` para todas as empresas
- Isso pode falhar se o cargo não pertencer à empresa

**Solução:** 
- Migrar apenas cargos que pertencem à empresa correspondente
- Ou desabilitar temporariamente a validação durante a migração

### 2. Políticas RLS Dependentes
- Existem **muitas** políticas RLS que dependem de `profiles.is_admin`
- Não podemos remover a coluna sem atualizar essas políticas primeiro

**Solução:**
- Atualizar todas as políticas para usar `user_empresa.is_admin` com contexto de empresa
- Ou criar uma função helper que verifica admin considerando empresa

---

## 📋 Plano de Execução Revisado

### FASE 1: Preparação ✅
- [x] Verificar estrutura atual
- [x] Identificar dependências

### FASE 2: Adicionar Colunas em `user_empresa` ✅
- [x] Adicionar `tipo_contrato`
- [x] Adicionar `data_inicio`
- [x] Adicionar `manual_cultura_aceito`
- [x] Adicionar `nivel_colaborador`
- [x] Adicionar `updated_at`

### FASE 3: Criar Função Helper para Verificar Admin ⏳
Criar função que verifica se usuário é admin considerando empresa:
```sql
CREATE OR REPLACE FUNCTION is_user_admin_for_company(
  user_id_param UUID,
  company_id_param UUID
) RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar super_admin primeiro
  IF EXISTS (SELECT 1 FROM profiles WHERE id = user_id_param AND super_admin = true) THEN
    RETURN true;
  END IF;
  
  -- Verificar admin da empresa
  RETURN EXISTS (
    SELECT 1 FROM user_empresa 
    WHERE user_id = user_id_param 
    AND empresa_id = company_id_param 
    AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### FASE 4: Atualizar Políticas RLS ⏳
Atualizar todas as políticas que usam `profiles.is_admin` para usar a nova função ou `user_empresa.is_admin`.

**Estratégia:**
1. Identificar todas as políticas
2. Atualizar uma por uma
3. Testar cada atualização

### FASE 5: Migração de Dados (Ajustada) ⏳
Migrar dados considerando validação de cargo:
```sql
-- Migrar apenas quando cargo pertence à empresa
UPDATE user_empresa ue
SET 
  cargo_id = p.cargo_id,
  tipo_contrato = p.tipo_contrato,
  data_inicio = p.data_inicio,
  manual_cultura_aceito = COALESCE(p.manual_cultura_aceito, false),
  nivel_colaborador = p.nivel_colaborador
FROM profiles p
JOIN job_roles jr ON jr.id = p.cargo_id
WHERE ue.user_id = p.id
AND ue.empresa_id = jr.company_id  -- Apenas se cargo pertence à empresa
AND p.cargo_id IS NOT NULL;
```

### FASE 6: Remover Colunas de `profiles` ⏳
Apenas após todas as políticas serem atualizadas.

---

## 🎯 Próximos Passos

1. **Criar função helper** para verificar admin por empresa
2. **Atualizar políticas RLS** gradualmente
3. **Migrar dados** com validação de cargo
4. **Remover colunas** após validação completa

---

**Status:** Aguardando execução das próximas fases

