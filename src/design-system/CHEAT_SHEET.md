# Design System - Cheat Sheet Rápido

Referência rápida dos padrões mais usados.

## 🎨 Cores

```tsx
// Background principal
bg-[#F8F7F4] dark:bg-[#191919]

// Cards
bg-white dark:bg-[#222222]
hover:bg-gray-50 dark:hover:bg-[#2C2C2C]

// Texto
text-gray-900 dark:text-white        // Principal
text-gray-700 dark:text-gray-200     // Secundário
text-gray-500 dark:text-gray-400     // Muted
```

## 📐 Espaçamento

```tsx
// Containers
px-4 lg:px-8          // Padding horizontal
py-8 lg:py-12         // Padding vertical

// Cards
p-6                   // Padding padrão
p-4                   // Padding compacto

// Gaps
gap-4                 // Pequeno
gap-6                 // Médio
gap-8                 // Grande

// Margins
mb-8                  // Padrão
mb-16                 // Grande
```

## ✍️ Tipografia

```tsx
// Hero
text-[24px] md:text-[40px] font-normal leading-[1.1]

// Títulos
text-2xl md:text-3xl font-semibold    // H1
text-xl font-semibold                  // H2

// Corpo
text-base                              // Padrão
text-sm                                // Pequeno
text-xs                                // Muito pequeno

// Pesos
font-normal    // 400
font-medium    // 500
font-semibold  // 600
font-bold      // 700
```

## 🧩 Componentes

### Card Padrão

```tsx
<Card className="border-0 shadow-none bg-white dark:bg-[#222222] rounded-[30px] hover:bg-gray-50 dark:hover:bg-[#2C2C2C] transition-all duration-700 ease-out hover:scale-105">
  <CardContent className="p-6">
    {/* Conteúdo */}
  </CardContent>
</Card>
```

### Botão Hero

```tsx
<Button className="bg-white hover:bg-white/90 text-black rounded-full px-5 py-4 md:px-6 md:py-5 h-auto font-semibold text-sm md:text-base flex items-center gap-2 shadow-lg transition-all hover:scale-105">
  <span>Texto</span>
  <Icon className="h-4 w-4" />
</Button>
```

### Badge sobre Imagem

```tsx
<Badge variant="outline" className="bg-transparent text-white border-white/80 hover:border-white rounded-full px-4 py-1.5 text-sm font-medium">
  Tag
</Badge>
```

## 🏗️ Layouts

### Container Principal

```tsx
<div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8">
  {/* Conteúdo */}
</div>
```

### Grid Responsivo

```tsx
// 3 colunas
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6

// 4 colunas
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4

// 5 colunas
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4
```

### Layout com Sidebar

```tsx
<div className="min-h-screen bg-[#F8F7F4] dark:bg-[#191919] flex flex-col">
  <MainNavigationMenu />
  <div className="flex-1 flex overflow-hidden">
    <SidebarProvider defaultOpen={true}>
      <Sidebar />
      <SidebarInset className="flex-1 bg-background min-h-0 overflow-y-auto !m-4 lg:!m-8 p-4 lg:p-8">
        {/* Conteúdo */}
      </SidebarInset>
    </SidebarProvider>
  </div>
</div>
```

## ✨ Animações

### Fade In Básico

```tsx
const [isVisible, setIsVisible] = useState(false);

useEffect(() => {
  requestAnimationFrame(() => setIsVisible(true));
}, []);

<div className={`transition-all duration-700 ease-out ${
  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
}`}>
```

### Com Delay Sequencial

```tsx
{elements.map((el, i) => (
  <div
    key={i}
    className={`transition-all duration-700 ease-out ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`}
    style={{ transitionDelay: `${i * 100 + 200}ms` }}
  >
```

### Hover Effects

```tsx
// Scale
hover:scale-105 transition-all duration-300

// Shadow
hover:shadow-lg hover:shadow-gray-100/50 dark:hover:shadow-gray-900/30

// Background
hover:bg-gray-50 dark:hover:bg-[#2C2C2C]
```

## 🎯 Border Radius

```tsx
rounded-lg      // 0.5rem
rounded-xl      // 1rem
rounded-2xl     // 1.5rem
rounded-[30px]  // 1.875rem (padrão cards)
rounded-full    // 9999px (botões, badges)
```

## 📱 Breakpoints

```tsx
// Mobile first
md:  // 768px
lg:  // 1024px
xl:  // 1280px
2xl: // 1536px
```

## 🌙 Dark Mode

Sempre inclua variantes dark:

```tsx
// Sempre use
className="bg-white dark:bg-[#222222]"
className="text-gray-900 dark:text-white"
className="border-gray-100 dark:border-gray-800"
```

## 🔗 Helpers Import

```tsx
import {
  getPageBackgroundClasses,
  getCardClasses,
  getTransitionClasses,
  getFadeInClasses,
  getContainerClasses
} from '@/design-system/tokens';
```



