# 🔧 Correção de Recursão RLS - Solução Simplificada

## ⚠️ Problema Identificado

**Erro:** `infinite recursion detected in policy for relation "profiles"`

O problema é que as políticas RLS estão fazendo SELECT de `profiles` dentro de políticas para `profiles`, causando recursão infinita.

## ✅ Solução Temporária Aplicada

1. **Removidas políticas complexas** que causavam recursão
2. **Mantida apenas política básica:** "Users can view their own profile"
3. **Criadas políticas simples** que não acessam `profiles` dentro da avaliação

## 🔍 Próximos Passos Necessários

A recursão pode estar vindo de:
- Outras políticas RLS em outras tabelas que tentam acessar `profiles`
- Funções SECURITY DEFINER que ainda acessam `profiles` durante avaliação de políticas

**Ação necessária:** Verificar logs do Supabase para ver exatamente qual política está causando a recursão.


