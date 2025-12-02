# 📊 Análise das Tabelas do Supabase - MNNO School

## 📈 Resumo Geral

- **Total de Tabelas:** 28 tabelas
- **Total de Migrações:** 33 migrações
- **RLS (Row Level Security):** Habilitado em todas as tabelas
- **Status do Banco:** ACTIVE_HEALTHY (PostgreSQL 15.8.1.054)

---

## 🗂️ Categorização das Tabelas

### 1. 👥 **AUTENTICAÇÃO E USUÁRIOS**

#### `profiles` (24 registros)
**Propósito:** Perfis de usuários do sistema
- **Campos principais:**
  - `id` (UUID) - Referência ao `auth.users.id`
  - `display_name` - Nome de exibição
  - `email` - Email do usuário
  - `avatar` - URL do avatar
  - `is_admin` - Se é admin
  - `super_admin` - Se é super admin
  - `cargo_id` → `job_roles.id` - Cargo/função do usuário
  - `primeiro_login` - Flag de primeiro acesso
  - `aniversario`, `cidade`, `data_inicio` - Dados pessoais
  - `tipo_contrato` - CLT, PJ ou Fornecedor
  - `nivel_colaborador` - Junior, Pleno ou Senior
  - `manual_cultura_aceito` - Aceite do manual

**Relacionamentos:**
- 1:1 com `auth.users` (via `id`)
- N:1 com `job_roles` (via `cargo_id`)
- 1:N com `user_empresa` (um usuário pode estar em várias empresas)

---

#### `user_empresa` (26 registros)
**Propósito:** Relação muitos-para-muitos entre usuários e empresas
- **Campos:**
  - `user_id` → `profiles.id`
  - `empresa_id` → `empresas.id`
  - `is_admin` - Se o usuário é admin da empresa
  - `created_at`

**Relacionamentos:**
- N:1 com `profiles`
- N:1 com `empresas`

---

#### `user_invites` (0 registros)
**Propósito:** Convites para novos usuários
- **Campos principais:**
  - `email` - Email do convidado
  - `display_name` - Nome do convidado
  - `company_id` → `empresas.id`
  - `expires_at` - Data de expiração
  - `used` - Se foi usado
  - `used_at` - Quando foi usado
  - Dados pré-preenchidos: `cidade`, `aniversario`, `data_inicio`, `tipo_contrato`, `nivel_colaborador`

---

### 2. 🏢 **EMPRESAS**

#### `empresas` (6 registros)
**Propósito:** Dados das empresas/clientes
- **Campos principais:**
  - `id` (UUID)
  - `nome` - Nome da empresa
  - `logo` - URL do logo
  - `cor_principal` - Cor principal (hex, default: #000000)
  - `frase_institucional` - Slogan/frase
  - `missao`, `historia`, `valores` - Textos institucionais
  - `video_institucional` - URL do vídeo
  - `descricao_video` - Descrição do vídeo
  - `created_by` → `auth.users.id`
  - `created_at`, `updated_at`

**Relacionamentos:**
- 1:N com `user_empresa` (muitos usuários por empresa)
- 1:N com `company_courses` (cursos da empresa)
- 1:N com `company_documents` (documentos da empresa)
- 1:N com `job_roles` (cargos da empresa)
- 1:N com `discussions` (discussões da empresa)
- 1:N com `company_notices` (avisos da empresa)
- 1:N com `company_videos` (vídeos da empresa)
- 1:N com `company_access` (acessos de ferramentas)

---

#### `job_roles` (9 registros)
**Propósito:** Cargos/funções dentro das empresas
- **Campos principais:**
  - `id` (UUID)
  - `company_id` → `empresas.id`
  - `title` - Título do cargo
  - `description` - Descrição
  - `responsibilities` - Responsabilidades
  - `requirements` - Requisitos
  - `expectations` - Expectativas
  - `order_index` - Ordem de exibição
  - `created_at`, `updated_at`

**Relacionamentos:**
- N:1 com `empresas`
- 1:N com `profiles` (usuários com esse cargo)
- 1:N com `course_job_roles` (cursos recomendados para o cargo)

---

### 3. 📚 **CURSOS E LIÇÕES**

#### `courses` (28 registros)
**Propósito:** Cursos disponíveis na plataforma
- **Campos principais:**
  - `id` (UUID)
  - `title` - Título do curso
  - `description` - Descrição
  - `image_url` - Imagem do curso
  - `instructor` - Instrutor
  - `tags` - Array de tags (ex: ["designer", "motion", "developer"])
  - `created_at`, `updated_at`

**Relacionamentos:**
- 1:N com `lessons` (lições do curso)
- 1:N com `company_courses` (empresas que têm acesso)
- 1:N com `user_course_progress` (progresso dos usuários)
- 1:N com `course_job_roles` (cargos recomendados)

---

#### `lessons` (66 registros)
**Propósito:** Lições individuais dentro dos cursos
- **Campos principais:**
  - `id` (UUID)
  - `course_id` → `courses.id`
  - `title` - Título da lição
  - `description` - Descrição
  - `content` - Conteúdo da lição
  - `type` - Tipo de lição
  - `duration` - Duração
  - `order_index` - Ordem dentro do curso
  - `completed` - Flag (não usado diretamente, usa `user_lesson_progress`)
  - `created_at`, `updated_at`

**Relacionamentos:**
- N:1 com `courses`
- 1:N com `user_lesson_progress` (progresso dos usuários)
- 1:N com `lesson_comments` (comentários)

---

#### `company_courses` (28 registros)
**Propósito:** Relação muitos-para-muitos entre empresas e cursos
- **Campos:**
  - `id` (UUID)
  - `empresa_id` → `empresas.id`
  - `course_id` → `courses.id`
  - `created_at`

**Relacionamentos:**
- N:1 com `empresas`
- N:1 com `courses`

---

#### `course_job_roles` (3 registros)
**Propósito:** Cursos recomendados para determinados cargos
- **Campos:**
  - `id` (UUID)
  - `course_id` → `courses.id`
  - `job_role_id` → `job_roles.id`
  - `created_at`

---

#### `user_course_progress` (17 registros)
**Propósito:** Progresso do usuário em cada curso
- **Campos principais:**
  - `id` (UUID)
  - `user_id` → `auth.users.id`
  - `course_id` → `courses.id`
  - `progress` - Percentual de progresso (0-100)
  - `completed` - Se completou o curso
  - `favorite` - Se está favoritado
  - `last_accessed` - Último acesso
  - `created_at`, `updated_at`

---

#### `user_lesson_progress` (125 registros)
**Propósito:** Progresso do usuário em cada lição
- **Campos principais:**
  - `id` (UUID)
  - `user_id` → `auth.users.id`
  - `lesson_id` → `lessons.id`
  - `completed` - Se completou a lição
  - `last_accessed` - Último acesso
  - `created_at`, `updated_at`

---

#### `user_course_suggestions` (0 registros)
**Propósito:** Sugestões de cursos para usuários
- **Campos principais:**
  - `id` (UUID)
  - `user_id` → `auth.users.id`
  - `course_id` → `courses.id`
  - `company_id` → `empresas.id`
  - `suggested_by` → `auth.users.id` (quem sugeriu)
  - `reason` - Motivo da sugestão
  - `order_index` - Ordem de exibição
  - `created_at`

---

### 4. 📄 **DOCUMENTOS**

#### `company_documents` (6 registros)
**Propósito:** Documentos da empresa
- **Campos principais:**
  - `id` (UUID)
  - `company_id` → `empresas.id`
  - `name` - Nome do documento
  - `document_type` - Tipo de documento
  - `attachment_type` - 'file' ou 'link'
  - `file_path` - Caminho do arquivo (se for arquivo)
  - `file_type` - Tipo do arquivo
  - `link_url` - URL (se for link)
  - `description` - Descrição
  - `created_by` → `profiles.id`
  - `created_at`, `updated_at`

**Relacionamentos:**
- N:1 com `empresas`
- N:1 com `profiles` (criador)
- 1:N com `company_document_users` (usuários com acesso)
- 1:N com `company_document_job_roles` (cargos com acesso)

---

#### `company_document_users` (0 registros)
**Propósito:** Usuários específicos com acesso a documentos
- **Campos:**
  - `id` (UUID)
  - `company_document_id` → `company_documents.id`
  - `user_id` → `profiles.id`
  - `created_at`

---

#### `company_document_job_roles` (0 registros)
**Propósito:** Cargos com acesso a documentos
- **Campos:**
  - `id` (UUID)
  - `company_document_id` → `company_documents.id`
  - `job_role_id` → `job_roles.id`
  - `created_at`

---

#### `user_documents` (7 registros)
**Propósito:** Documentos pessoais dos usuários
- **Campos principais:**
  - `id` (UUID)
  - `user_id` → `auth.users.id`
  - `company_id` → `empresas.id`
  - `name` - Nome do documento
  - `document_type` - Tipo
  - `attachment_type` - 'file' ou 'link'
  - `file_path` - Caminho (se arquivo)
  - `file_type` - Tipo do arquivo
  - `link_url` - URL (se link)
  - `description` - Descrição
  - `uploaded_by` → `auth.users.id`
  - `uploaded_at`

---

### 5. 💬 **COMUNIDADE E INTERAÇÃO**

#### `discussions` (4 registros)
**Propósito:** Discussões/Posts na comunidade
- **Campos principais:**
  - `id` (UUID)
  - `company_id` → `empresas.id`
  - `author_id` → `auth.users.id`
  - `title` - Título
  - `content` - Conteúdo
  - `status` - Status (default: 'open')
  - `image_url` - Imagem anexada
  - `video_url` - Vídeo anexado
  - `created_at`, `updated_at`

**Relacionamentos:**
- N:1 com `empresas`
- N:1 com `auth.users` (autor)
- 1:N com `discussion_replies` (respostas)

---

#### `discussion_replies` (1 registro)
**Propósito:** Respostas às discussões
- **Campos principais:**
  - `id` (UUID)
  - `discussion_id` → `discussions.id`
  - `author_id` → `auth.users.id`
  - `content` - Conteúdo da resposta
  - `image_url` - Imagem anexada
  - `video_url` - Vídeo anexado
  - `created_at`

---

#### `lesson_comments` (0 registros)
**Propósito:** Comentários nas lições
- **Campos principais:**
  - `id` (UUID)
  - `lesson_id` → `lessons.id`
  - `user_id` → `auth.users.id`
  - `content` - Conteúdo do comentário
  - `created_at`

---

### 6. 🔔 **NOTIFICAÇÕES E FEEDBACK**

#### `user_notifications` (319 registros)
**Propósito:** Notificações para usuários
- **Campos principais:**
  - `id` (UUID)
  - `user_id` → `auth.users.id`
  - `company_id` → `empresas.id`
  - `title` - Título
  - `content` - Conteúdo
  - `type` - Tipo (default: 'notice')
  - `related_id` - ID relacionado (opcional)
  - `read` - Se foi lida (default: false)
  - `created_at`

---

#### `user_feedbacks` (12 registros)
**Propósito:** Feedbacks entre usuários
- **Campos principais:**
  - `id` (UUID)
  - `from_user_id` → `auth.users.id` (quem enviou)
  - `to_user_id` → `auth.users.id` (quem recebeu)
  - `company_id` → `empresas.id`
  - `content` - Conteúdo do feedback
  - `created_at`, `updated_at`

---

### 7. 🔐 **ACESSOS E CREDENCIAIS**

#### `user_access` (13 registros)
**Propósito:** Credenciais de acesso pessoais dos usuários
- **Campos principais:**
  - `id` (UUID)
  - `user_id` → `auth.users.id`
  - `tool_name` - Nome da ferramenta
  - `username` - Usuário
  - `password` - Senha (pode estar criptografada)
  - `password_encrypted` - Senha criptografada
  - `encryption_key` - Chave de criptografia (bytea)
  - `url` - URL da ferramenta
  - `notes` - Notas
  - `created_at`, `updated_at`

**Segurança:** Sistema de criptografia implementado

---

#### `company_access` (5 registros)
**Propósito:** Credenciais de acesso compartilhadas da empresa
- **Campos principais:**
  - `id` (UUID)
  - `company_id` → `empresas.id`
  - `tool_name` - Nome da ferramenta
  - `username` - Usuário
  - `password` - Senha (pode estar criptografada)
  - `password_encrypted` - Senha criptografada
  - `encryption_key` - Chave de criptografia (bytea)
  - `url` - URL da ferramenta
  - `notes` - Notas
  - `created_by` → `auth.users.id`
  - `created_at`

**Segurança:** Sistema de criptografia implementado

---

### 8. 📝 **NOTAS E CONFIGURAÇÕES**

#### `user_notes` (0 registros)
**Propósito:** Notas pessoais dos usuários
- **Campos principais:**
  - `id` (UUID)
  - `user_id` → `auth.users.id`
  - `title` - Título
  - `content` - Conteúdo
  - `color` - Cor (default: '#ffffff')
  - `pinned` - Se está fixada (default: false)
  - `created_at`, `updated_at`

---

#### `company_notices` (0 registros)
**Propósito:** Avisos da empresa
- **Campos principais:**
  - `id` (UUID)
  - `company_id` → `empresas.id`
  - `title` - Título
  - `content` - Conteúdo
  - `type` - Tipo (default: 'geral')
  - `created_by` → `auth.users.id`
  - `visibilidade` - Se está visível (default: true)
  - `created_at`, `updated_at`

---

#### `notice_companies` (0 registros)
**Propósito:** Relação entre avisos e empresas (para avisos multi-empresa)
- **Campos:**
  - `id` (UUID)
  - `notice_id` → `company_notices.id`
  - `company_id` → `empresas.id`
  - `created_at`

---

#### `company_videos` (0 registros)
**Propósito:** Vídeos institucionais da empresa
- **Campos principais:**
  - `id` (UUID)
  - `company_id` → `empresas.id`
  - `title` - Título
  - `description` - Descrição
  - `video_url` - URL do vídeo
  - `thumbnail_url` - URL da thumbnail
  - `duration` - Duração
  - `order_index` - Ordem de exibição
  - `created_at`, `updated_at`

---

#### `settings` (0 registros)
**Propósito:** Configurações globais do sistema
- **Campos principais:**
  - `id` (UUID)
  - `key` - Chave (única)
  - `value` - Valor
  - `media_type` - Tipo de mídia ('video' ou 'image')
  - `created_at`, `updated_at`

---

## 🔗 Diagrama de Relacionamentos Principais

```
auth.users
    ↓ (1:1)
profiles ──→ job_roles (cargo_id)
    ↓ (1:N)
user_empresa ──→ empresas
    ↓ (1:N)
    ├── company_courses ──→ courses ──→ lessons
    ├── company_documents
    ├── job_roles
    ├── discussions ──→ discussion_replies
    ├── company_notices
    ├── company_videos
    └── company_access

courses ──→ user_course_progress
lessons ──→ user_lesson_progress
```

---

## 🔒 Segurança (RLS)

Todas as tabelas têm **Row Level Security (RLS) habilitado**, garantindo que:
- Usuários só vejam dados das empresas às quais pertencem
- Apenas admins podem modificar certos dados
- Políticas de acesso baseadas em `user_id` e `company_id`

---

## 📊 Estatísticas de Uso

| Tabela | Registros | Status |
|--------|-----------|--------|
| `user_notifications` | 319 | 🔥 Muito usado |
| `user_lesson_progress` | 125 | 🔥 Muito usado |
| `lessons` | 66 | ✅ Ativo |
| `courses` | 28 | ✅ Ativo |
| `company_courses` | 28 | ✅ Ativo |
| `user_empresa` | 26 | ✅ Ativo |
| `profiles` | 24 | ✅ Ativo |
| `user_course_progress` | 17 | ✅ Ativo |
| `user_access` | 13 | ✅ Ativo |
| `user_feedbacks` | 12 | ✅ Ativo |
| `job_roles` | 9 | ✅ Ativo |
| `user_documents` | 7 | ✅ Ativo |
| `empresas` | 6 | ✅ Ativo |
| `company_documents` | 6 | ✅ Ativo |
| `discussions` | 4 | ✅ Ativo |
| `company_access` | 5 | ✅ Ativo |
| `discussion_replies` | 1 | ⚠️ Pouco usado |
| `user_notes` | 0 | ⚠️ Não usado |
| `user_invites` | 0 | ⚠️ Não usado |
| `user_course_suggestions` | 0 | ⚠️ Não usado |
| `company_notices` | 0 | ⚠️ Não usado |
| `company_videos` | 0 | ⚠️ Não usado |
| `settings` | 0 | ⚠️ Não usado |

---

## 🎯 Funcionalidades Principais

1. **Multi-tenant:** Sistema suporta múltiplas empresas
2. **Cursos e Aprendizado:** Sistema completo de cursos, lições e progresso
3. **Comunidade:** Discussões e interações entre usuários
4. **Documentos:** Gestão de documentos por empresa e por usuário
5. **Notificações:** Sistema robusto de notificações (319 registros)
6. **Segurança:** Criptografia de senhas e RLS em todas as tabelas
7. **Feedback:** Sistema de feedback entre colaboradores
8. **Acessos:** Gestão de credenciais pessoais e compartilhadas

---

## 🔧 Funções SQL Disponíveis

O banco possui várias funções SQL para operações seguras:
- `encrypt_password()` / `decrypt_password()` - Criptografia
- `is_admin()`, `is_super_admin()` - Verificação de permissões
- `user_belongs_to_company()` - Verificação de acesso
- `get_user_companies()` - Listagem segura de empresas
- `create_user_access()`, `create_company_access()` - Criação segura de acessos
- E muitas outras...

---

## 📝 Observações

1. **Tabelas não utilizadas:** Algumas tabelas como `user_notes`, `user_invites`, `company_videos` estão vazias - podem ser funcionalidades futuras ou pouco utilizadas.

2. **Sistema de criptografia:** Tanto `user_access` quanto `company_access` têm sistema de criptografia implementado com `encryption_key` e `password_encrypted`.

3. **Multi-empresa:** O sistema é totalmente multi-tenant, com a maioria das tabelas vinculadas a `empresas`.

4. **Progresso de aprendizado:** Sistema robusto de tracking de progresso com `user_course_progress` e `user_lesson_progress`.

5. **Notificações ativas:** 319 notificações indicam sistema muito utilizado.

---

**Última atualização:** Janeiro 2025

