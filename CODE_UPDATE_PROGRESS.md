# 📝 Progresso da Atualização do Código

## ✅ Hooks Helper Criados

1. **`useUserCompanyRole.ts`** ✅
   - Hook para obter cargo do usuário na empresa selecionada
   - Retorna: `cargoId`, `jobRole`, `isAdmin`, `isLoading`, `error`

2. **`useUpdateUserCompanyRole.ts`** ✅
   - Hook para atualizar cargo de usuário em empresa
   - Função: `updateUserCompanyRole(userId, companyId, cargoId)`

3. **`useUserCompanyAdmin.ts`** ✅
   - Hook para verificar se usuário é admin de empresa
   - Retorna: `isAdmin`, `isLoading`

---

## ✅ Arquivos Atualizados

### 1. `src/pages/Integration.tsx` ✅
- ✅ `fetchUserRole()` agora busca de `user_empresa.cargo_id` ao invés de `profiles.cargo_id`
- ✅ Considera empresa no contexto

### 2. `src/components/admin/integration/UserRoleAssignment.tsx` ✅
- ✅ Busca cargo de `user_empresa` para a empresa específica
- ✅ `handleSaveRole()` atualiza `user_empresa.cargo_id`
- ✅ `handleRemoveRole()` remove cargo de `user_empresa`

---

## 🔄 Arquivos que Precisam Ser Atualizados

### Prioridade Alta:
1. ⏳ `src/hooks/collaborator/useFetchCompanyUsers.ts` - Busca `profiles.cargo_id`
2. ⏳ `src/hooks/company-documents/useCompanyUsers.ts` - Busca `profiles.cargo_id`
3. ⏳ `src/hooks/team/useTeamMembers.ts` - Usa `profiles.is_admin`
4. ⏳ `src/hooks/auth/useUserProfile.ts` - Retorna `cargo_id` (precisa ajustar tipo)
5. ⏳ `src/pages/TeamMemberProfile.tsx` - Busca `profiles.cargo_id` e `profiles.is_admin`

### Prioridade Média:
6. ⏳ `src/hooks/courses/useCoursesFetching.ts` - Usa `userProfile?.cargo_id`
7. ⏳ `src/hooks/my-courses/useCourseData.ts` - Usa `userProfile?.cargo_id`
8. ⏳ `src/services/course/fetchCourses.ts` - Usa `userProfile?.cargo_id`
9. ⏳ `src/components/home/FeedbackWidget.tsx` - Usa `profile.cargo_id`
10. ⏳ Vários outros arquivos que usam `cargo_id` ou `is_admin` de profiles

---

## 🐛 Problema do Avatar

**Status:** Investigando

O avatar está sendo selecionado na query (usa `*`), mas pode não estar aparecendo por:
1. URL inválida ou vazia no banco
2. Problema de RLS bloqueando acesso
3. Falha no carregamento da imagem

**Ações:**
- Verificar se `avatar` está sendo retornado na query
- Verificar políticas RLS para acesso ao campo avatar
- Verificar URLs de avatar no banco

---

## 📋 Checklist de Migração

- [x] Criar hooks helper
- [x] Atualizar Integration.tsx
- [x] Atualizar UserRoleAssignment.tsx
- [ ] Atualizar hooks de usuários/colaboradores
- [ ] Atualizar hooks de cursos
- [ ] Atualizar componentes de time
- [ ] Resolver problema do avatar
- [ ] Testar tudo
- [ ] Remover colunas antigas

---

**Última atualização:** Janeiro 2025

