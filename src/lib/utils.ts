import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converte uma cor hexadecimal para RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calcula a luminância relativa de uma cor (0-1)
 * Baseado na fórmula WCAG: https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  // Normalizar valores RGB para 0-1
  const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255];

  // Aplicar função de correção gama
  const [rs, gs, bs] = [r, g, b].map((val) => {
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });

  // Calcular luminância relativa
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Determina se uma cor é clara (luminância > 0.5) ou escura
 */
export function isLightColor(hex: string): boolean {
  return getLuminance(hex) > 0.5;
}

/**
 * Retorna uma cor de texto apropriada baseada no contraste
 * Retorna branco para fundos escuros e preto/escuro para fundos claros
 */
export function getContrastTextColor(backgroundColor: string): string {
  if (isLightColor(backgroundColor)) {
    // Para fundos claros, usar texto escuro
    return "#1F2937"; // gray-800 - bom contraste em fundos claros
  } else {
    // Para fundos escuros, usar texto branco
    return "#FFFFFF";
  }
}

/**
 * Retorna uma versão escurecida da cor para garantir contraste
 * Útil quando a cor original é muito clara e precisa ser usada como texto
 */
export function getDarkenedColor(hex: string, amount: number = 0.3): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#000000";

  // Escurecer reduzindo cada componente RGB
  const r = Math.max(0, Math.floor(rgb.r * (1 - amount)));
  const g = Math.max(0, Math.floor(rgb.g * (1 - amount)));
  const b = Math.max(0, Math.floor(rgb.b * (1 - amount)));

  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Retorna uma versão clareada da cor
 */
export function getLightenedColor(hex: string, amount: number = 0.3): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#FFFFFF";

  // Clarear aumentando cada componente RGB
  const r = Math.min(255, Math.floor(rgb.r + (255 - rgb.r) * amount));
  const g = Math.min(255, Math.floor(rgb.g + (255 - rgb.g) * amount));
  const b = Math.min(255, Math.floor(rgb.b + (255 - rgb.b) * amount));

  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Retorna uma cor de texto segura para usar sobre uma cor de fundo
 * Se a cor de fundo for clara, retorna uma versão escurecida da cor
 * Se a cor de fundo for escura, retorna branco
 */
export function getSafeTextColor(companyColor: string, useOnBackground: boolean = false): string {
  if (useOnBackground) {
    // Quando usado sobre a própria cor como fundo
    return getContrastTextColor(companyColor);
  } else {
    // Quando usado como cor de texto sobre fundo branco/claro
    if (isLightColor(companyColor)) {
      // Se a cor é clara, escurecer levemente para garantir visibilidade (reduzido de 0.4 para 0.2)
      return getDarkenedColor(companyColor, 0.2);
    }
    return companyColor;
  }
}

/**
 * Calcula o contraste entre duas cores (ratio WCAG)
 * Retorna um valor entre 1 e 21
 * WCAG AA requer pelo menos 4.5:1 para texto normal, 3:1 para texto grande
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Verifica se o contraste entre duas cores atende aos padrões WCAG AA
 */
export function hasAdequateContrast(color1: string, color2: string, isLargeText: boolean = false): boolean {
  const ratio = getContrastRatio(color1, color2);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Sugere um título baseado no nome do arquivo
 * Remove extensão, substitui underscores/hífens por espaços, capitaliza palavras
 */
export function suggestDocumentTitle(fileName: string): string {
  if (!fileName) return '';
  
  // Remove extensão
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
  
  // Substitui underscores, hífens e pontos por espaços
  const withSpaces = nameWithoutExt.replace(/[._-]/g, ' ');
  
  // Remove múltiplos espaços
  const cleaned = withSpaces.replace(/\s+/g, ' ').trim();
  
  // Capitaliza primeira letra de cada palavra
  const words = cleaned.split(' ');
  const capitalized = words.map(word => {
    if (word.length === 0) return word;
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
  
  return capitalized.join(' ');
}
