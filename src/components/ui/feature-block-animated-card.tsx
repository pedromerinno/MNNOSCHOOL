import { animate, motion } from "framer-motion"
import React, { useEffect } from "react"
import { cn } from "@/lib/utils"

export interface AnimatedCardProps {
  className?: string
  title?: React.ReactNode
  description?: React.ReactNode
  icons?: Array<{
    icon: React.ReactNode
    size?: "sm" | "md" | "lg"
    className?: string
  }>
  companyColor?: string
}

const sizeMap = {
  sm: "h-7 w-7",
  md: "h-10 w-10",
  lg: "h-12 w-12",
}

// Função para converter cor para rgba com opacidade
const colorToRgba = (color: string, opacity: number): string => {
  // Se já for rgba, extrair os valores RGB
  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbaMatch) {
    return `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, ${opacity})`;
  }
  
  // Se for hex
  const hexMatch = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
  if (hexMatch) {
    const r = parseInt(hexMatch[1], 16);
    const g = parseInt(hexMatch[2], 16);
    const b = parseInt(hexMatch[3], 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  
  // Se for hex curto (3 dígitos)
  const hexShortMatch = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(color);
  if (hexShortMatch) {
    const r = parseInt(hexShortMatch[1] + hexShortMatch[1], 16);
    const g = parseInt(hexShortMatch[2] + hexShortMatch[2], 16);
    const b = parseInt(hexShortMatch[3] + hexShortMatch[3], 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  
  // Se não conseguir converter, retornar a cor original
  return color;
};

export function AnimatedCard({ className, title, description, icons = [], companyColor }: AnimatedCardProps) {
  // Criar cor suave para o borrão de fundo (opacidade muito baixa)
  const backgroundBlurColor = companyColor 
    ? colorToRgba(companyColor, 0.08) // Muito suave/claro
    : undefined;

  return (
    <div
      className={cn(
        "max-w-sm w-full mx-auto px-4 py-5 rounded-xl border border-[rgba(255,255,255,0.10)] dark:bg-[rgba(40,40,40,0.70)] bg-gray-100 shadow-[2px_4px_16px_0px_rgba(248,248,248,0.06)_inset] group",
        className
      )}
    >
      <div
        className={cn(
          "h-32 md:h-36 rounded-xl z-40",
          "[mask-image:radial-gradient(50%_50%_at_50%_50%,white_0%,transparent_100%)]",
          !backgroundBlurColor && "bg-neutral-300 dark:bg-[rgba(40,40,40,0.70)]"
        )}
        style={backgroundBlurColor ? {
          backgroundColor: backgroundBlurColor,
        } : undefined}
      >
        <AnimatedIcons icons={icons} companyColor={companyColor} />
      </div>
      {title && (
        <h3 className="text-base font-semibold text-gray-800 dark:text-white py-2 mt-3">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-sm font-normal text-neutral-600 dark:text-neutral-400">
          {description}
        </p>
      )}
    </div>
  )
}

function AnimatedIcons({ icons, companyColor }: { icons: AnimatedCardProps["icons"], companyColor?: string }) {
  const scale = [1, 1.1, 1]
  const transform = ["translateY(0px)", "translateY(-4px)", "translateY(0px)"]
  
  const sequence = icons.map((_, index) => [
    `.circle-${index + 1}`,
    { scale, transform },
    { duration: 0.8 },
  ])

  useEffect(() => {
    animate(sequence, {
      repeat: Infinity,
      repeatDelay: 1,
    })
  }, [])

  // Função para aplicar a cor da empresa aos ícones (apenas stroke, sem fill)
  const applyCompanyColor = (icon: React.ReactNode): React.ReactNode => {
    if (!companyColor || !React.isValidElement(icon)) return icon;
    
    return React.cloneElement(icon as React.ReactElement<any>, {
      style: {
        ...((icon as React.ReactElement).props?.style || {}),
        color: companyColor,
        fill: 'none', // Remove o preenchimento
      },
      className: cn(
        (icon as React.ReactElement).props?.className || '',
        'transition-colors'
      ),
    });
  };

  return (
    <div className="p-4 overflow-hidden h-full relative flex items-center justify-center">
      <div className="flex flex-row flex-shrink-0 justify-center items-center gap-2">
        {icons.map((icon, index) => (
          <Container
            key={index}
            className={cn(
              sizeMap[icon.size || "md"],
              `circle-${index + 1}`,
              icon.className
            )}
          >
            {applyCompanyColor(icon.icon)}
          </Container>
        ))}
      </div>
      <AnimatedSparkles companyColor={companyColor} />
    </div>
  )
}

const Container = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      `rounded-full flex items-center justify-center bg-[rgba(248,248,248,0.01)]
      shadow-[0px_0px_8px_0px_rgba(248,248,248,0.25)_inset,0px_32px_24px_-16px_rgba(0,0,0,0.40)]`,
      className
    )}
    {...props}
  />
))
Container.displayName = "Container"

const AnimatedSparkles = ({ companyColor }: { companyColor?: string }) => {
  const sparkleColor = companyColor || "rgb(6, 182, 212)"; // cyan-500 como padrão
  
  return (
    <div 
      className="h-24 w-px absolute top-1/2 -translate-y-1/2 m-auto z-40 bg-gradient-to-b from-transparent to-transparent animate-move"
      style={{
        background: `linear-gradient(to bottom, transparent, ${sparkleColor}, transparent)`,
      }}
    >
      <div className="w-8 h-20 top-1/2 -translate-y-1/2 absolute -left-8">
        <Sparkles companyColor={companyColor} />
      </div>
    </div>
  )
}

const Sparkles = ({ companyColor }: { companyColor?: string }) => {
  const randomMove = () => Math.random() * 2 - 1
  const randomOpacity = () => Math.random()
  const random = () => Math.random()
  const sparkleColor = companyColor || "rgb(0, 0, 0)"; // preto como padrão no light mode

  return (
    <div className="absolute inset-0">
      {[...Array(12)].map((_, i) => (
        <motion.span
          key={`star-${i}`}
          animate={{
            top: `calc(${random() * 100}% + ${randomMove()}px)`,
            left: `calc(${random() * 100}% + ${randomMove()}px)`,
            opacity: randomOpacity(),
            scale: [1, 1.2, 0],
          }}
          transition={{
            duration: random() * 2 + 4,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            position: "absolute",
            top: `${random() * 100}%`,
            left: `${random() * 100}%`,
            width: `2px`,
            height: `2px`,
            borderRadius: "50%",
            zIndex: 1,
            backgroundColor: sparkleColor,
          }}
          className="inline-block dark:bg-white"
        />
      ))}
    </div>
  )
}

