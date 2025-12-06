# Integration Style Components

Componentes reutilizáveis no estilo da página de integração para criar páginas consistentes e modernas.

## IntegrationStylePage

Componente principal que fornece o layout completo no estilo da página de integração, incluindo sidebar, navegação, animações e estilos modernos.

### Características

- ✅ Layout com sidebar navegável
- ✅ Animações suaves ao scrollar
- ✅ Cards interativos com efeitos visuais
- ✅ Sistema de cores da empresa
- ✅ Design responsivo
- ✅ Dark mode suportado
- ✅ Navegação flutuante opcional

### Uso Básico

```tsx
import { IntegrationStylePage, IntegrationSection } from '@/components/integration/layout/IntegrationStylePage';
import { BookOpen, Users } from 'lucide-react';

const MyPage = () => {
  const sections = [
    { id: 'section1', label: 'Seção 1', icon: BookOpen },
    { id: 'section2', label: 'Seção 2', icon: Users },
  ];

  return (
    <IntegrationStylePage
      title="Minha Página"
      sections={sections}
    >
      <IntegrationSection
        id="section1"
        title="Primeira Seção"
        withCard
        cardBorderBeam
      >
        <p>Conteúdo da primeira seção</p>
      </IntegrationSection>

      <IntegrationSection
        id="section2"
        title="Segunda Seção"
        withCard
      >
        <p>Conteúdo da segunda seção</p>
      </IntegrationSection>
    </IntegrationStylePage>
  );
};
```

### Props do IntegrationStylePage

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `title` | `string` | **requerido** | Título da página |
| `children` | `ReactNode` | **requerido** | Conteúdo principal |
| `sections` | `PageSection[]` | `[]` | Seções para navegação na sidebar |
| `showBackButton` | `boolean` | `true` | Mostrar botão de voltar |
| `backPath` | `string` | `'/'` | Path para voltar |
| `showCompanyBadge` | `boolean` | `true` | Mostrar badge da empresa |
| `showSidebar` | `boolean` | `true` | Mostrar sidebar |
| `showFooter` | `boolean` | `true` | Mostrar footer |
| `className` | `string` | `''` | Classe CSS adicional |
| `customHeader` | `ReactNode` | `undefined` | Header customizado |
| `heroSection` | `ReactNode` | `undefined` | Seção hero customizada |

### Props do IntegrationSection

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `id` | `string` | **requerido** | ID único da seção |
| `title` | `string` | `undefined` | Título da seção |
| `subtitle` | `string` | `undefined` | Subtítulo da seção |
| `companyColor` | `string` | `auto` | Cor da empresa (auto-detected) |
| `direction` | `'up' \| 'down' \| 'left' \| 'right' \| 'fade'` | `'up'` | Direção da animação |
| `delay` | `number` | `0.05` | Delay da animação em segundos |
| `children` | `ReactNode` | **requerido** | Conteúdo da seção |
| `withCard` | `boolean` | `false` | Envolver em InteractiveCard |
| `cardBorderBeam` | `boolean` | `false` | Mostrar efeito BorderBeam no card |
| `className` | `string` | `''` | Classe CSS adicional |

### Exemplos Avançados

#### Página sem sidebar

```tsx
<IntegrationStylePage
  title="Página Simples"
  showSidebar={false}
>
  <div>Conteúdo sem sidebar</div>
</IntegrationStylePage>
```

#### Header customizado

```tsx
<IntegrationStylePage
  title="Página Customizada"
  customHeader={
    <div className="mb-8">
      <h1>Header Personalizado</h1>
      <p>Descrição customizada</p>
    </div>
  }
>
  <div>Conteúdo</div>
</IntegrationStylePage>
```

#### Seções com diferentes animações

```tsx
<IntegrationSection
  id="section1"
  title="Animação de Cima"
  direction="up"
  delay={0.1}
  withCard
>
  Conteúdo
</IntegrationSection>

<IntegrationSection
  id="section2"
  title="Animação da Esquerda"
  direction="left"
  delay={0.2}
  withCard
>
  Conteúdo
</IntegrationSection>
```

#### Seção sem card

```tsx
<IntegrationSection
  id="section3"
  title="Sem Card"
  withCard={false}
>
  <div className="p-6 bg-white rounded-lg">
    Conteúdo direto
  </div>
</IntegrationSection>
```

### Componentes Relacionados

O componente também re-exporta os seguintes componentes para uso direto:

- `ScrollSection` - Seção com animação ao entrar na viewport
- `InteractiveCard` - Card interativo com efeitos visuais
- `SectionTitle` - Título de seção estilizado

### Integração com a Página de Integração

Este componente segue o mesmo padrão visual da página de integração (`/integration`), garantindo consistência visual em toda a aplicação.






