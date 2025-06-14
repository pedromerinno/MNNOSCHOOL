
# Documentação do Projeto - Plataforma de Gestão Educacional

## Visão Geral do Projeto

Esta é uma plataforma completa de gestão educacional e empresarial construída com React, TypeScript, Supabase e Tailwind CSS. A plataforma oferece funcionalidades para gestão de usuários, empresas, cursos, documentos e muito mais.

## Arquitetura do Sistema

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Routing**: React Router DOM
- **State Management**: React Context + Custom Hooks
- **Icons**: Lucide React

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (quando necessário)
- **Real-time**: Supabase Realtime (configurado conforme necessário)

## Estrutura de Pastas

```
src/
├── components/           # Componentes React reutilizáveis
│   ├── admin/           # Componentes de administração
│   ├── auth/            # Componentes de autenticação
│   ├── courses/         # Componentes de cursos
│   ├── documents/       # Componentes de documentos
│   ├── home/            # Componentes da página inicial
│   ├── integration/     # Componentes de integração
│   ├── navigation/      # Componentes de navegação
│   ├── profile/         # Componentes de perfil
│   ├── team/            # Componentes de equipe
│   └── ui/              # Componentes UI base (shadcn/ui)
├── contexts/            # Contextos React (AuthContext, etc.)
├── hooks/               # Hooks customizados
├── pages/               # Páginas da aplicação
├── types/               # Definições de tipos TypeScript
├── utils/               # Utilitários e helpers
└── integrations/        # Configurações de integrações (Supabase)
```

## Sistema de Autenticação

### Funcionalidades
- Login/Signup com email e senha
- Gestão de sessões
- Redirecionamentos automáticos
- Sincronização de perfis entre auth.users e profiles

### Componentes Principais
- `AuthContext`: Gerencia estado de autenticação global
- `useAuth`: Hook para acessar dados de autenticação
- `ProtectedRoute`: Componente para proteger rotas

### Fluxo de Autenticação
1. Usuário faz login/signup
2. Supabase Auth valida credenciais
3. Perfil é criado/atualizado na tabela `profiles`
4. Estado global é atualizado via AuthContext
5. Usuário é redirecionado para página apropriada

## Sistema de Permissões

### Hierarquia de Usuários
1. **Super Admin**: Acesso total ao sistema
2. **Admin**: Acesso às empresas vinculadas
3. **Usuário Regular**: Acesso limitado aos recursos da empresa

### Implementação
- Column `super_admin` na tabela `profiles`
- Column `is_admin` na tabela `profiles`
- Funções SQL seguras para verificação de permissões
- Row Level Security (RLS) em todas as tabelas

## Gestão de Empresas

### Funcionalidades
- Criação e edição de empresas
- Vinculação de usuários às empresas
- Gestão de múltiplas empresas por usuário
- Seleção de empresa ativa

### Componentes Principais
- `CompanyManagement`: Gestão administrativa de empresas
- `CompanySelector`: Seletor de empresa ativa
- `useCompanies`: Hook para gerenciar dados de empresas

### Tabelas Relacionadas
- `empresas`: Dados das empresas
- `user_empresa`: Relacionamento usuário-empresa

## Gestão de Usuários

### Funcionalidades
- Listagem de usuários com filtros
- Criação de novos usuários
- Edição de perfis
- Promoção/remoção de permissões admin
- Exclusão segura de usuários
- Sistema de convites

### Componentes Principais
- `UserManagement`: Interface principal de gestão
- `UserTableOptimized`: Tabela otimizada de usuários
- `CreateUserDialog`: Diálogo para criação de usuários
- `InviteCompanySelector`: Seletor para convites

### Funcionalidades de Segurança
- Função `delete_user_safely`: Exclusão cascata segura
- Validações de permissão antes de ações críticas
- Auditoria de ações administrativas

## Sistema de Cursos

### Funcionalidades
- Gestão de cursos e lições
- Progresso de usuários
- Comentários em lições
- Favoritos
- Categorização e tags

### Componentes Principais
- `CourseManagement`: Gestão administrativa
- `CourseCard`: Card de curso
- `LessonPage`: Página de lição
- `CourseProgress`: Acompanhamento de progresso

### Tabelas Relacionadas
- `courses`: Dados dos cursos
- `lessons`: Lições dos cursos
- `user_course_progress`: Progresso do usuário
- `user_lesson_progress`: Progresso em lições
- `company_courses`: Vinculação empresa-curso

## Sistema de Documentos

### Funcionalidades
- Upload e gestão de documentos
- Categorização de documentos
- Prévia de documentos
- Controle de acesso por empresa

### Componentes Principais
- `DocumentUploadForm`: Formulário de upload
- `DocumentList`: Listagem de documentos
- `DocumentPreview`: Prévia de documentos

### Tabelas Relacionadas
- `user_documents`: Documentos dos usuários

## Sistema de Notificações

### Funcionalidades
- Notificações automáticas para eventos
- Marcação de lidas/não lidas
- Diferentes tipos de notificação

### Triggers Automáticos
- Novos cursos
- Novas lições
- Avisos da empresa
- Discussões criadas

### Tabela
- `user_notifications`: Notificações dos usuários

## Padrões de Desenvolvimento

### Convenções de Nomenclatura
- **Componentes**: PascalCase (`UserManagement`)
- **Hooks**: camelCase com prefixo `use` (`useUsers`)
- **Tipos**: PascalCase (`UserProfile`)
- **Arquivos**: kebab-case para pastas, PascalCase para componentes

### Estrutura de Componentes
- Componentes funcionais com TypeScript
- Props tipadas com interfaces
- Uso de hooks customizados para lógica
- Separação clara entre UI e lógica de negócio

### Gerenciamento de Estado
- Context API para estado global (Auth, Companies)
- Hooks customizados para estado local
- Cache otimizado para dados frequentemente acessados

### Tratamento de Erros
- Try-catch em operações assíncronas
- Exibição de mensagens de erro amigáveis
- Logs detalhados para debugging
- Fallbacks graceful para falhas de rede

## Otimizações de Performance

### Frontend
- Lazy loading de componentes
- Memoização com React.memo quando necessário
- Cache de dados com TTL
- Paginação em listas grandes

### Backend
- Índices otimizados nas tabelas
- Funções SQL para operações complexas
- Row Level Security para segurança e performance
- Limits em queries para evitar sobrecarga

## Configurações de Segurança

### Row Level Security (RLS)
- Habilitado em todas as tabelas sensíveis
- Políticas específicas por tipo de usuário
- Funções SECURITY DEFINER para operações privilegiadas

### Validações
- Validação de entrada em todos os formulários
- Sanitização de dados antes de persistir
- Verificações de permissão em todas as operações

## Principais Hooks Customizados

### `useAuth`
- Gerencia estado de autenticação
- Sincronização de perfil
- Métodos de login/logout

### `useUsers`
- Gestão de usuários
- Cache otimizado
- Operações CRUD seguras

### `useCompanies`
- Gestão de empresas
- Seleção de empresa ativa
- Cache de relacionamentos

### `useOptimizedCache`
- Sistema de cache com TTL
- Limpa cache automaticamente
- Otimiza requisições repetitivas

## Componentes UI Padronizados

### shadcn/ui
- Sistema de design consistente
- Componentes acessíveis
- Customizável via Tailwind

### Componentes Customizados
- `Button`: Botões padronizados
- `Dialog`: Modais consistentes
- `Table`: Tabelas responsivas
- `Form`: Formulários validados

## Integração com Supabase

### Configuração
- Cliente configurado em `src/integrations/supabase/client.ts`
- Tipos gerados automaticamente
- Row Level Security habilitado

### Operações Comuns
- Queries com filtros e joins
- Upserts para sincronização
- Transações para operações complexas
- Real-time para atualizações em tempo real

## Deployment e Ambiente

### Variáveis de Ambiente
- Configuradas automaticamente pelo Lovable
- URLs e chaves do Supabase injetadas automaticamente

### Build
- Processo automatizado via Lovable
- Otimizações de produção aplicadas
- Deploy automático após mudanças

## Manutenção e Evolução

### Logs e Debugging
- Console logs estratégicos
- Tratamento de erros com contexto
- Monitoramento de performance

### Escalabilidade
- Arquitetura modular
- Hooks reutilizáveis
- Componentes desacoplados
- Cache eficiente

### Testes
- Tipos TypeScript garantem consistência
- Validação de props em tempo de compilação
- Testes manuais em ambiente de desenvolvimento

## Funcionalidades Específicas

### Sistema de Convites
- Criação de usuários pré-configurados
- Vinculação automática à empresa
- Dados de perfil pré-preenchidos

### Gestão de Documentos por Usuário
- Upload categorizado
- Controle de acesso
- Prévia inline quando possível

### Sistema de Feedback
- Feedback entre usuários da mesma empresa
- Histórico de feedbacks
- Edição e exclusão controlada

### Integração com Loom
- Metadados automáticos de vídeos
- Edge function para buscar dados
- Thumbnails e duração automáticas

## Considerações de UX/UI

### Responsividade
- Design mobile-first
- Breakpoints do Tailwind
- Componentes adaptáveis

### Acessibilidade
- Componentes shadcn/ui são acessíveis por padrão
- Labels apropriados
- Navegação por teclado

### Loading States
- Skeletons para carregamento
- Estados de loading específicos
- Feedback visual para ações

### Error States
- Mensagens de erro claras
- Opções de retry
- Fallbacks visuais

## Performance Monitoring

### Métricas Observadas
- Tempo de carregamento de páginas
- Performance de queries
- Cache hit ratio
- Erros de JavaScript

### Otimizações Aplicadas
- Code splitting por página
- Lazy loading de componentes pesados
- Debounce em campos de busca
- Throttling em scroll handlers
