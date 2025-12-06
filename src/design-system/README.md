# Design System - Merinno School

Design system documentado baseado nas páginas favoritas da plataforma: **Home**, **My Courses** e **Dashboard (Admin)**.

## 📁 Estrutura

```
src/design-system/
├── README.md           # Este arquivo - guia de uso
├── DESIGN_SYSTEM.md    # Documentação completa do design system
├── tokens.ts           # Tokens TypeScript reutilizáveis
└── examples.tsx        # Componentes de exemplo práticos
```

## 🚀 Como Usar

### 1. Importar Tokens

```tsx
import { 
  colors, 
  spacing, 
  typography, 
  getCardClasses, 
  getTransitionClasses 
} from '@/design-system/tokens';
```

### 2. Usar Helpers de Classes

```tsx
// Background padrão das páginas
<div className={getPageBackgroundClasses()}>
  {/* Conteúdo */}
</div>

// Card padrão
<Card className={getCardClasses('hover')}>
  {/* Conteúdo */}
</Card>

// Transições
<div className={getTransitionClasses('slow')}>
  {/* Conteúdo */}
</div>
```

### 3. Usar Componentes de Exemplo

```tsx
import { 
  QuickLinkCard, 
  HeroBanner, 
  MetricCard,
  WelcomeSection 
} from '@/design-system/examples';

// Usar diretamente ou como referência
<QuickLinkCard
  icon={BookOpen}
  label="Meus Cursos"
  description="Acesse seus cursos"
  index={0}
  onClick={() => navigate('/my-courses')}
/>
```

### 4. Seguir Padrões Documentados

Consulte `DESIGN_SYSTEM.md` para:
- Paleta de cores completa
- Escala tipográfica
- Padrões de espaçamento
- Layouts padrão
- Efeitos e transições

## 🎨 Padrões Principais

### Cores de Background

```tsx
// Sempre use estas cores para consistência
className="bg-[#F8F7F4] dark:bg-[#191919]"
```

### Cards

```tsx
// Card padrão com hover
<Card className="bg-white dark:bg-[#222222] rounded-[30px] hover:bg-gray-50 dark:hover:bg-[#2C2C2C] transition-all duration-700 ease-out hover:scale-105">
```

### Tipografia

```tsx
// Título principal
className="text-2xl md:text-3xl font-semibold"

// Texto corpo
className="text-base text-gray-700 dark:text-gray-200"
```

### Animações

```tsx
// Fade in padrão
const [isVisible, setIsVisible] = useState(false);

useEffect(() => {
  requestAnimationFrame(() => {
    setIsVisible(true);
  });
}, []);

<div className={`transition-all duration-700 ease-out ${
  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
}`}>
```

## 📚 Documentação Completa

Para detalhes completos sobre:
- Todas as cores e variantes
- Sistema de espaçamento
- Componentes e suas variantes
- Layouts padrão
- Dark mode
- Efeitos e transições

Consulte: [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md)

## 💡 Dicas

1. **Sempre use os helpers** quando disponíveis para manter consistência
2. **Consulte os exemplos** em `examples.tsx` antes de criar novos componentes
3. **Mantenha a consistência** com as cores e espaçamentos definidos
4. **Teste em dark mode** - todos os componentes devem funcionar bem em ambos os temas

## 🔄 Atualizações

Este design system é baseado nas páginas favoritas:
- ✅ Home (`/`)
- ✅ My Courses (`/my-courses`)
- ✅ Dashboard Admin (`/admin`)

Quando essas páginas forem atualizadas, este design system deve ser revisado e atualizado para manter a consistência.






