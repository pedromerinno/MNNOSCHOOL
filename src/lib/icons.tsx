import * as FiIcons from "react-icons/fi";
import { IconType } from "react-icons";
import React from "react";

/**
 * Tipo para os nomes dos ícones do Feather Icons (react-icons/fi)
 * Extrai os nomes dos ícones disponíveis dinamicamente
 */
export type IconName = keyof typeof FiIcons;

/**
 * Obtém um componente de ícone pelo nome
 * 
 * @example
 * ```tsx
 * const HomeIcon = getIcon('FiHome');
 * <HomeIcon className="w-6 h-6" />
 * ```
 */
export function getIcon(name: IconName): IconType {
  const Icon = FiIcons[name];
  if (!Icon) {
    console.warn(`Icon "${name}" not found in react-icons/fi`);
    return FiIcons.FiAlertCircle; // Fallback icon
  }
  return Icon;
}

/**
 * Componente wrapper para ícones do Feather Icons
 * Facilita o uso tipado dos ícones
 * 
 * @example
 * ```tsx
 * <Icon name="FiHome" className="w-6 h-6" />
 * ```
 */
export interface IconProps {
  name: IconName;
  className?: string;
  size?: number | string;
  color?: string;
}

export const Icon: React.FC<IconProps> = ({ 
  name, 
  className, 
  size = 24,
  color 
}) => {
  const IconComponent = getIcon(name);
  const style = color ? { color } : undefined;
  
  return React.createElement(IconComponent, {
    className,
    size,
    style
  });
};

/**
 * Exporta todos os ícones do Feather Icons para uso direto
 * 
 * @example
 * ```tsx
 * import { FiHome, FiUser } from '@/lib/icons';
 * 
 * <FiHome className="w-6 h-6" />
 * ```
 */
export * as FiIcons from "react-icons/fi";

// Re-exporta ícones individuais para facilitar importação
export {
  FiHome,
  FiUser,
  FiSettings,
  FiBell,
  FiMenu,
  FiX,
  FiSearch,
  FiFileText,
  FiPlay,
  FiClock,
  FiCheck,
  FiPlus,
  FiEdit,
  FiTrash,
  FiDownload,
  FiUpload,
  FiEye,
  FiEyeOff,
  FiLock,
  FiUnlock,
  FiMail,
  FiKey,
  FiLogOut,
  FiLogIn,
  FiChevronRight,
  FiChevronLeft,
  FiChevronDown,
  FiChevronUp,
  FiArrowRight,
  FiArrowLeft,
  FiCalendar,
  FiMessageSquare,
  FiUsers,
  FiBook,
  FiBookOpen,
  FiShield,
  FiLink,
  FiGlobe,
  FiHeart,
  FiStar,
  FiFilter,
  FiMoreVertical,
  FiMoreHorizontal,
  FiAlertCircle,
  FiLayout,
  FiBriefcase,
} from "react-icons/fi";

