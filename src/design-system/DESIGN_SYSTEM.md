# Design System - Merinno School

Design system baseado nas páginas favoritas: **Home**, **My Courses** e **Dashboard (Admin)**.

---

## 📐 Índice

1. [Cores e Paletas](#cores-e-paletas)
2. [Tipografia](#tipografia)
3. [Espaçamento](#espaçamento)
4. [Componentes Base](#componentes-base)
5. [Layouts](#layouts)
6. [Efeitos e Transições](#efeitos-e-transições)
7. [Dark Mode](#dark-mode)
8. [Padrões de Uso](#padrões-de-uso)

---

## 🎨 Cores e Paletas

### Backgrounds Principais

```css
/* Light Mode */
--background-light: #F8F7F4  /* Background principal */
--card-light: #FFFFFF        /* Cards e containers */
--card-hover-light: #F5F5F5 /* Hover state */

/* Dark Mode */
--background-dark: #191919    /* Background principal */
--card-dark: #222222         /* Cards e containers */
--card-hover-dark: #2C2C2C   /* Hover state */
```

### Cores Semânticas

```css
/* Texto */
--foreground-light: #1A1A1A
--foreground-dark: #FFFFFF
--muted-light: #6B7280
--muted-dark: #9CA3AF

/* Ações */
--primary: hsl(240, 5.9%, 10%)
--primary-foreground: hsl(0, 0%, 98%)
--destructive: hsl(0, 84.2%, 60.2%)
--accent: hsl(240, 4.8%, 95.9%)
```

### Uso em Classes Tailwind

```tsx
// Background principal das páginas
className="bg-[#F8F7F4] dark:bg-[#191919]"

// Cards
className="bg-white dark:bg-[#222222]"

// Cards com hover
className="bg-white dark:bg-[#222222] hover:bg-gray-50 dark:hover:bg-[#2C2C2C]"
```

---

## ✍️ Tipografia

### Fonte

**Inter** - Fonte principal do sistema

```css
font-family: 'Inter', system-ui, Avenir, Helvetica, Arial, sans-serif;
```

### Escala Tipográfica

```tsx
// Títulos Principais (Hero)
className="text-[24px] md:text-[40px] font-normal leading-[1.1]"

// Títulos de Seção
className="text-2xl md:text-3xl font-semibold"

// Títulos de Card
className="text-xl font-semibold"

// Texto Corpo
className="text-base text-gray-700 dark:text-gray-200"

// Texto Secundário
className="text-sm text-gray-500 dark:text-gray-400"

// Texto Pequeno
className="text-xs text-gray-500 dark:text-gray-400"
```

### Pesos de Fonte

- `font-normal` (400) - Texto corpo e hero
- `font-medium` (500) - Labels e links
- `font-semibold` (600) - Títulos e destaques
- `font-bold` (700) - Valores e métricas importantes

---

## 📏 Espaçamento

### Sistema de Espaçamento

```tsx
// Containers principais
className="px-4 lg:px-8"        // Padding horizontal
className="py-8 lg:py-12"        // Padding vertical

// Cards
className="p-6"                  // Padding padrão de card
className="p-4"                  // Padding compacto

// Gaps entre elementos
className="gap-4"                // Gap padrão
className="gap-6"                // Gap médio
className="gap-8"                // Gap grande

// Espaçamento entre seções
className="space-y-8"            // Espaçamento vertical entre seções
className="mb-8"                 // Margin bottom padrão
className="mb-16"                // Margin bottom grande
```

### Layouts Responsivos

```tsx
// Grid responsivo
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"

// Flex responsivo
className="flex flex-col lg:flex-row gap-8"

// Container máximo
className="w-full max-w-[1600px] mx-auto"
```

---

## 🧩 Componentes Base

### Card

**Padrão de Card das páginas favoritas:**

```tsx
<Card className="border-0 shadow-none bg-white dark:bg-[#222222] rounded-[30px] hover:bg-gray-50 dark:hover:bg-[#2C2C2C] transition-all duration-700 ease-out hover:scale-105">
  <CardContent className="p-6">
    {/* Conteúdo */}
  </CardContent>
</Card>
```

**Variantes:**

```tsx
// Card com borda sutil
<Card className="border border-gray-100 dark:border-gray-800 shadow-sm">

// Card com hover mais sutil
<Card className="bg-white dark:bg-gray-900 rounded-2xl hover:shadow-lg hover:shadow-gray-100/50 dark:hover:shadow-gray-900/30 transition-all duration-300">
```

### Button

**Botão Principal (Hero Banner):**

```tsx
<Button className="bg-white hover:bg-white/90 text-black rounded-full px-5 py-4 md:px-6 md:py-5 h-auto font-semibold text-sm md:text-base flex items-center gap-2 shadow-lg transition-all hover:scale-105">
  <span>Assistir agora</span>
  <Play className="h-4 w-4 md:h-5 md:w-5 fill-black" />
</Button>
```

**Botão Padrão:**

```tsx
<Button className="text-white dark:text-black rounded-full text-sm bg-black dark:bg-white hover:bg-black/90 dark:hover:bg-white/90">
  Saiba mais
</Button>
```

### Badge

```tsx
// Badge outline com borda branca (sobre imagens)
<Badge
  variant="outline"
  className="bg-transparent text-white border-white/80 hover:border-white rounded-full px-4 py-1.5 text-sm font-medium"
>
  {tag}
</Badge>

// Badge padrão
<Badge className="px-3 py-1.5 rounded-full text-xs font-medium">
  Sugerido
</Badge>
```

### Avatar

```tsx
<Avatar className="h-10 w-10 border-2 border-white dark:border-gray-800">
  <AvatarImage src={avatar} alt={name} />
  <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-sm font-semibold">
    {initials}
  </AvatarFallback>
</Avatar>
```

---

## 🏗️ Layouts

### Layout Principal (Home)

```tsx
<div className="min-h-screen bg-[#F8F7F4] dark:bg-[#191919]">
  <main className="container mx-auto px-4 py-8">
    {/* Conteúdo */}
  </main>
</div>
```

### Layout com Sidebar (My Courses / Admin)

```tsx
<div className="min-h-screen bg-[#F8F7F4] dark:bg-[#191919] flex flex-col">
  <MainNavigationMenu />
  <div className="flex-1 flex overflow-hidden">
    <SidebarProvider defaultOpen={true}>
      <div className="flex w-full h-full">
        <Sidebar />
        <SidebarInset className="flex-1 bg-background min-h-0 overflow-y-auto !m-4 lg:!m-8 p-4 lg:p-8">
          {/* Conteúdo */}
        </SidebarInset>
      </div>
    </SidebarProvider>
  </div>
</div>
```

### Layout Dashboard

```tsx
<div className="min-h-screen bg-[#F8F7F4] dark:bg-[#191919] flex flex-col">
  <MainNavigationMenu />
  <main className="flex-1">
    <div className="w-full px-4 lg:px-8">
      {/* Conteúdo */}
    </div>
  </main>
  <footer className="py-16 text-center text-sm text-gray-500">
    {/* Footer */}
  </footer>
</div>
```

### Grid de Métricas (Dashboard)

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {metrics.map((metric) => (
    <Card className="border border-gray-100 dark:border-gray-800 shadow-sm">
      <CardContent className="p-4">
        {/* Métrica */}
      </CardContent>
    </Card>
  ))}
</div>
```

### Hero Banner (My Courses)

```tsx
<div className="relative w-full rounded-3xl overflow-hidden mb-8">
  <div className="relative aspect-[16/7] w-full min-h-[300px] md:min-h-[400px] lg:min-h-[450px]">
    <img
      src={imageSrc}
      alt={title}
      className="w-full h-full object-cover"
    />
    {/* Gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-black/30 to-transparent" />
    
    {/* Content Overlay */}
    <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-8 lg:p-10 xl:p-12 text-white z-10">
      {/* Conteúdo */}
    </div>
  </div>
</div>
```

---

## ✨ Efeitos e Transições

### Animações de Entrada

**Fade In com Translate Y:**

```tsx
const [isVisible, setIsVisible] = useState(false);

useEffect(() => {
  requestAnimationFrame(() => {
    setIsVisible(true);
  });
}, []);

<div className={`transition-all duration-700 ease-out ${
  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
}`}>
  {/* Conteúdo */}
</div>
```

**Com Delay Sequencial:**

```tsx
{elements.map((element, index) => (
  <div
    key={index}
    className={`transition-all duration-700 ease-out ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`}
    style={{
      transitionDelay: `${index * 100 + 200}ms`
    }}
  >
    {/* Elemento */}
  </div>
))}
```

### Hover Effects

```tsx
// Scale on hover
className="hover:scale-105 transition-all duration-300"

// Shadow on hover
className="hover:shadow-lg hover:shadow-gray-100/50 dark:hover:shadow-gray-900/30 transition-all duration-300"

// Background change
className="hover:bg-gray-50 dark:hover:bg-[#2C2C2C] transition-all duration-300"

// Image zoom on hover
className="group-hover:scale-[1.01] transition-transform duration-700"
```

### Transições Padrão

```tsx
// Transição rápida
className="transition-all duration-300"

// Transição média
className="transition-all duration-500"

// Transição suave (padrão das páginas favoritas)
className="transition-all duration-700 ease-out"
```

---

## 🌙 Dark Mode

### Padrões de Cores Dark Mode

```tsx
// Backgrounds
bg-[#F8F7F4] dark:bg-[#191919]
bg-white dark:bg-[#222222]
bg-gray-50 dark:bg-gray-800

// Texto
text-gray-900 dark:text-white
text-gray-700 dark:text-gray-200
text-gray-500 dark:text-gray-400
text-gray-500 dark:text-[#757576]

// Borders
border-gray-100 dark:border-gray-800
border-white/30 dark:border-gray-800
```

### Cards Dark Mode

```tsx
// Card padrão
className="bg-white dark:bg-[#222222]"

// Card hover
className="hover:bg-gray-50 dark:hover:bg-[#2C2C2C]"

// Card com sombra
className="hover:shadow-lg hover:shadow-gray-100/50 dark:hover:shadow-gray-900/30"
```

### Botões Dark Mode

```tsx
// Botão invertido (branco no dark)
className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90"
```

---

## 📋 Padrões de Uso

### Header com Greeting (My Courses)

```tsx
<div className="mb-8">
  <div className="hidden md:flex items-center justify-between gap-4">
    {/* Left: Greeting */}
    <div className="flex items-center gap-4 flex-shrink-0">
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
        Olá, {firstName}
      </h1>
    </div>

    {/* Center: Search */}
    <div className="flex-1 max-w-md mx-4">
      <SearchBar />
    </div>

    {/* Right: Time, Theme, Avatars */}
    <div className="flex items-center gap-4 flex-shrink-0">
      {/* Elementos */}
    </div>
  </div>
</div>
```

### Grid de Cards (Quick Links)

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
  {links.map((link, index) => (
    <Card 
      key={index} 
      className="border-0 shadow-none bg-white dark:bg-[#222222] rounded-[30px] cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2C2C2C] transition-all duration-700 ease-out hover:scale-105"
      style={{
        transitionDelay: `${index * 50 + 100}ms`
      }}
    >
      <CardContent className="p-6 flex flex-col">
        {/* Conteúdo do card */}
      </CardContent>
    </Card>
  ))}
</div>
```

### Seção Welcome (Home)

```tsx
<div className="mb-16 mt-10">
  <div className="flex flex-col items-center">
    {/* Badge de boas-vindas */}
    <p className="text-gray-700 dark:text-gray-200 mb-6 text-center bg-[#FFF5E4] dark:bg-[#333333] py-1.5 px-6 rounded-full max-w-fit text-sm font-semibold">
      Olá, {userName}
    </p>
    
    {/* Título principal */}
    <p className="text-foreground text-center text-[24px] md:text-[40px] font-normal max-w-[90%] md:max-w-[50%] leading-[1.1] mb-5">
      {companyPhrase}
    </p>
    
    {/* Botão CTA */}
    <Button className="mt-1 flex items-center gap-2 text-white dark:text-black rounded-full text-sm bg-black dark:bg-white">
      Saiba mais
      <ArrowRight className="h-4 w-4" />
    </Button>
  </div>
</div>
```

### Card de Métrica (Dashboard)

```tsx
<Card className="border border-gray-100 dark:border-gray-800 shadow-sm">
  <CardContent className="p-4">
    <div className="space-y-1">
      <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">
        {title}
      </h3>
      <div className="flex justify-between items-center">
        <p className="text-2xl font-bold">{value}</p>
        {/* Gráfico ou ícone opcional */}
      </div>
      {/* Change indicator */}
      <div className="mt-0.5 flex items-center gap-1">
        <span className={`text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {change}
        </span>
      </div>
    </div>
  </CardContent>
</Card>
```

---

## 🎯 Princípios de Design

### 1. **Consistência Visual**
- Uso consistente de cores de background: `#F8F7F4` (light) e `#191919` (dark)
- Cards sempre com `rounded-[30px]` ou `rounded-2xl`
- Espaçamento padronizado: `p-6` para cards, `gap-6` para grids

### 2. **Hierarquia Visual**
- Títulos principais: `text-2xl md:text-3xl font-semibold`
- Texto corpo: `text-base`
- Texto secundário: `text-sm text-gray-500`

### 3. **Interatividade Suave**
- Transições de `duration-700 ease-out` para elementos principais
- Hover effects sutis: `hover:scale-105` e mudanças de background
- Animações de entrada com delays sequenciais

### 4. **Responsividade**
- Mobile-first approach
- Breakpoints: `md:` (768px) e `lg:` (1024px)
- Grids adaptativos: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

### 5. **Acessibilidade**
- Contraste adequado entre texto e background
- Estados de hover claros
- Suporte completo a dark mode

---

## 📚 Recursos Adicionais

### Componentes UI Base
- Localização: `src/components/ui/`
- Baseado em: shadcn/ui
- Componentes principais: Card, Button, Badge, Avatar, Sidebar

### Utilitários
- `cn()` - Função para merge de classes (Tailwind)
- Localização: `src/lib/utils.ts`

### Ícones
- Biblioteca: `lucide-react`
- Uso: `<Icon className="h-4 w-4" />`

---

**Última atualização:** Baseado nas páginas Home, My Courses e Dashboard (Admin) - 2024




