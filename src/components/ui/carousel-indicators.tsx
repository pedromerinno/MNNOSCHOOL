"use client";

import { CarouselApi } from "./carousel";
import { cn } from "@/lib/utils";

// Ícone de pause preenchido
const PauseIconFilled = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
  </svg>
);

export interface CarouselIndicatorsProps {
  /**
   * Progresso de scroll do carrossel (0 a 1)
   * 0 = início, 1 = fim
   */
  scrollProgress: number;
  carouselApi?: CarouselApi;
  className?: string;
}

/**
 * Componente padrão de indicadores para carrossel
 * Exibe um botão de pause e indicadores visuais baseados na posição de rolagem
 */
export const CarouselIndicators = ({
  scrollProgress,
  carouselApi,
  className,
}: CarouselIndicatorsProps) => {
  // Não renderizar se não houver API (carrossel não inicializado)
  if (!carouselApi) {
    return null;
  }

  const snapList = carouselApi.scrollSnapList();
  if (snapList.length <= 1) {
    return null;
  }

  // Número fixo de indicadores baseado apenas na rolagem, não na quantidade de itens
  // Usar 5 indicadores para não poluir a interface
  const NUM_INDICATORS = 5;
  
  // Calcular qual indicador está ativo baseado exclusivamente no progresso de scroll (0 a 1)
  const activeIndicatorIndex = Math.round(scrollProgress * (NUM_INDICATORS - 1));

  return (
    <div className={cn("flex items-center justify-center gap-3", className)}>
      {/* Botão circular de pause */}
      <button
        className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow p-2"
        aria-label="Pause carousel"
      >
        {/* Ícone de pause preenchido */}
        <PauseIconFilled className="w-4 h-4 text-gray-700 dark:text-gray-300" />
      </button>

      {/* Container horizontal com indicadores - mesma altura do botão com padding lateral */}
      <div className="flex items-center gap-1.5 px-4 h-10 bg-gray-100 dark:bg-gray-800 rounded-full">
        {Array.from({ length: NUM_INDICATORS }).map((_, index) => {
          const isCurrent = activeIndicatorIndex === index;
          
          // Calcular para qual posição de scroll navegar baseado no indicador clicado
          // Converter o índice do indicador (0 a NUM_INDICATORS-1) para progresso (0 a 1)
          const targetProgress = index / (NUM_INDICATORS - 1);
          
          // Converter progresso para slide usando snapList
          const targetSlide = Math.round(targetProgress * (snapList.length - 1));
          
          return (
            <button
              key={index}
              onClick={() => carouselApi?.scrollTo(targetSlide)}
              className={cn(
                "transition-all duration-300 rounded-full",
                isCurrent 
                  ? "h-1.5 w-8" // Barra horizontal mais larga para o atual
                  : "h-1.5 w-1.5" // Ponto pequeno para os outros
              )}
              style={{
                backgroundColor: '#374151', // gray-700
              }}
              aria-label={`Go to position ${index + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
};

