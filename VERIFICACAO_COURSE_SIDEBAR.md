# Verificação do CourseSidebar - Status e Recomendações

## ✅ 1. Avatar
**Status:** ✅ Funcionando corretamente

- O avatar está sendo carregado de `userProfile?.avatar` do contexto de autenticação
- O campo `avatar` está armazenado na tabela `profiles` do banco de dados
- O componente mostra fallback com iniciais quando não há avatar
- Suporte a upload de avatar já existe no sistema

**Localização do código:**
- `src/components/courses/CourseSidebar.tsx` (linhas 64-72)
- Avatar vem de `useAuth()` hook que busca de `profiles.avatar`

---

## ✅ 2. Cursos Completos (antes "Vídeos Completos")
**Status:** ✅ Já está correto

- O texto já está como **"Cursos completos"** no componente (linha 94)
- O valor vem de `stats.completed` que conta cursos completados (não vídeos individuais)
- Cálculo baseado em `user_course_progress.completed = true`

**Localização do código:**
- `src/components/courses/CourseSidebar.tsx` (linha 94): texto "Cursos completos"
- `src/hooks/my-courses/useCourseData.ts` (linha 242): cálculo de `completed`

---

## ⚠️ 3. Horas Assistidas
**Status:** ⚠️ Usando estimativa, pode ser melhorado

**Situação Atual:**
- Está usando uma **estimativa** de 15 minutos por aula completa
- Fórmula: `(completedLessonsCount * 15) / 60`
- Não está usando as durações reais das aulas

**Estrutura disponível:**
- A tabela `lessons` tem o campo `duration` (string, formato como "15min" ou "1h 30min")
- Podemos usar as durações reais das aulas completadas para cálculo preciso

**Recomendação:**
- Melhorar o cálculo para usar as durações reais das aulas da tabela `lessons`
- Somar apenas as durações das aulas completadas pelo usuário
- Já existe utilidade `durationUtils.ts` que pode ajudar no parsing

**Localização do código:**
- `src/hooks/my-courses/useCourseData.ts` (linha 239): cálculo estimado
- `src/utils/durationUtils.ts`: utilitários para parsing de duração
- `src/integrations/supabase/types.ts` (linha 614): campo `duration` na tabela `lessons`

---

## ✅ 4. Temas Sugeridos
**Status:** ✅ Estrutura já existe e está funcionando

**Implementação:**
- Hook `useSuggestedTopics` já está implementado e em uso
- Busca tags dos cursos sugeridos para o usuário (`user_course_suggestions`)
- Também considera tags dos cursos disponíveis na empresa (não completados)
- Mostra os top 2-4 temas mais relevantes com cores personalizadas

**Funcionalidades:**
- Prioriza cursos sugeridos (peso 3) vs cursos disponíveis (peso 1)
- Exclui cursos já completados
- Ordena por frequência
- Integrado com sistema de sugestões de cursos

**Localização do código:**
- `src/components/courses/CourseSidebar.tsx` (linhas 56, 154-176): uso do hook e renderização
- `src/hooks/my-courses/useSuggestedTopics.ts`: implementação completa
- Tabela `user_course_suggestions` no banco de dados

**Estrutura de dados:**
- Tabela `user_course_suggestions` com campos: `course_id`, `user_id`, `company_id`, `suggested_by`, `reason`, `order_index`
- Relação com `courses.tags` para extrair temas

---

## 📋 Resumo de Ações Recomendadas

### ✅ Concluído
1. ✅ **Melhorar cálculo de Horas Assistidas** - agora usa durações reais das aulas
   - Implementada função `durationToHours()` em `durationUtils.ts`
   - Atualizado `useCourseData.ts` para buscar durações reais das aulas completadas
   - Fallback para estimativa se durações não estiverem disponíveis

### Já Funcionando Corretamente
2. ✅ Avatar - funcionando corretamente
3. ✅ Cursos Completos - já está correto
4. ✅ Temas Sugeridos - já está implementado

---

## 🔍 Alterações Implementadas

### 1. Nova função utilitária: `durationToHours()`
**Arquivo:** `src/utils/durationUtils.ts`

- Converte string de duração (ex: "15min", "1h 30min") para horas decimais
- Suporta formatos: "15min", "1h", "1h 30min", etc.
- Retorna número decimal (ex: 0.25 para 15min, 1.5 para 1h 30min)

### 2. Cálculo melhorado de horas assistidas
**Arquivo:** `src/hooks/my-courses/useCourseData.ts`

- Busca as aulas completadas do usuário
- Busca as durações reais das aulas completadas
- Soma todas as durações convertidas para horas
- Arredonda para 1 casa decimal
- Usa fallback para estimativa (15min por aula) se durações não estiverem disponíveis

### Melhorias de Performance
- Busca as durações apenas quando necessário
- Mantém o fallback para não quebrar se houver dados incompletos

