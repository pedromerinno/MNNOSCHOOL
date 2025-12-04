// Tremor Badge [v1.0.0]

import React from "react"
import { tv, type VariantProps } from "tailwind-variants"
import { cn, getSafeTextColor } from "@/lib/utils"
import { useCompanies } from "@/hooks/useCompanies"
import { useState, useEffect } from "react"

const badgeVariants = tv({
  base: cn(
    "inline-flex items-center gap-x-1 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
  ),
  variants: {
    variant: {
      default: [
        "bg-blue-50 text-blue-900 ring-blue-500/30",
        "dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30",
      ],
      neutral: [
        "bg-gray-50 text-gray-900 ring-gray-500/30",
        "dark:bg-gray-400/10 dark:text-gray-400 dark:ring-gray-400/20",
      ],
      success: [
        "bg-emerald-50 text-emerald-900 ring-emerald-600/30",
        "dark:bg-emerald-400/10 dark:text-emerald-400 dark:ring-emerald-400/20",
      ],
      error: [
        "bg-red-50 text-red-900 ring-red-600/20",
        "dark:bg-red-400/10 dark:text-red-400 dark:ring-red-400/20",
      ],
      warning: [
        "bg-yellow-50 text-yellow-900 ring-yellow-600/30",
        "dark:bg-yellow-400/10 dark:text-yellow-500 dark:ring-yellow-400/20",
      ],
      // Legacy variants for backward compatibility
      secondary: [
        "bg-gray-50 text-gray-900 ring-gray-500/30",
        "dark:bg-gray-400/10 dark:text-gray-400 dark:ring-gray-400/20",
      ],
      destructive: [
        "bg-red-50 text-red-900 ring-red-600/20",
        "dark:bg-red-400/10 dark:text-red-400 dark:ring-red-400/20",
      ],
      outline: [
        "bg-transparent text-gray-900 ring-gray-500/30",
        "dark:text-gray-400 dark:ring-gray-400/20",
      ],
      beta: [
        "bg-blue-50 text-blue-900 ring-blue-500/30",
        "dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30",
      ],
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

interface BadgeProps
  extends React.ComponentPropsWithoutRef<"span">,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }: BadgeProps, forwardedRef) => {
    return (
      <span
        ref={forwardedRef}
        className={cn(badgeVariants({ variant }), className)}
        tremor-id="tremor-raw"
        {...props}
      />
    )
  },
)

Badge.displayName = "Badge"

// Add a company-themed badge that dynamically uses the company color
function CompanyThemedBadge({ 
  className, 
  variant = "default", 
  ...props 
}: BadgeProps) {
  const { selectedCompany } = useCompanies();
  
  const [companyColor, setCompanyColor] = useState<string>("#1EAEDB");
  
  // Atualizar quando a seleção mudar
  useEffect(() => {
    if (selectedCompany?.cor_principal) {
      console.log('CompanyThemedBadge: Atualizando cor da empresa:', selectedCompany.cor_principal);
      setCompanyColor(selectedCompany.cor_principal);
    }
  }, [selectedCompany?.cor_principal]);

  // Listener para eventos de atualização
  useEffect(() => {
    const handleCompanyUpdate = (event: CustomEvent) => {
      const { company } = event.detail;
      if (company?.cor_principal && selectedCompany?.id === company.id) {
        console.log('CompanyThemedBadge: Atualizando cor via evento:', company.cor_principal);
        setCompanyColor(company.cor_principal);
      }
    };

    window.addEventListener('company-updated', handleCompanyUpdate as EventListener);
    window.addEventListener('company-name-changed', handleCompanyUpdate as EventListener);
    window.addEventListener('company-selected', handleCompanyUpdate as EventListener);

    return () => {
      window.removeEventListener('company-updated', handleCompanyUpdate as EventListener);
      window.removeEventListener('company-name-changed', handleCompanyUpdate as EventListener);
      window.removeEventListener('company-selected', handleCompanyUpdate as EventListener);
    };
  }, [selectedCompany?.id]);
  
  // Helper function to convert hex to rgba
  const hexToRgba = (hex: string, alpha: number): string => {
    // Remove # if present
    let cleanHex = hex.replace('#', '');
    
    // Handle 3-digit hex colors
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map(char => char + char).join('');
    }
    
    // Ensure we have a valid 6-digit hex
    if (cleanHex.length !== 6) {
      // Fallback to default color if invalid
      cleanHex = '1EAEDB';
    }
    
    const r = parseInt(cleanHex.slice(0, 2), 16);
    const g = parseInt(cleanHex.slice(2, 4), 16);
    const b = parseInt(cleanHex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  
  // Set custom styles for company colors
  const style: React.CSSProperties = {
    transition: 'all 0.3s ease',
    // Override Tailwind ring with company color
    boxShadow: `inset 0 0 0 1px ${hexToRgba(companyColor, 0.2)}`,
  };
  
  if (variant === "default" || variant === "beta") {
    // For default and beta variants, apply company colors
    style.backgroundColor = hexToRgba(companyColor, 0.1); // Light background (10% opacity - mais claro)
    // Usar cor segura para garantir visibilidade mesmo com cores claras
    style.color = getSafeTextColor(companyColor, false);
  }
  
  // Apply company color to outline variant as well
  if (variant === "outline") {
    // Usar cor segura para garantir visibilidade mesmo com cores claras
    style.color = getSafeTextColor(companyColor, false);
    style.backgroundColor = 'transparent';
  }
  
  return (
    <span 
      className={cn(badgeVariants({ variant }), className, "transition-colors duration-300")} 
      style={style}
      {...props} 
    />
  )
}

export { Badge, CompanyThemedBadge, badgeVariants, type BadgeProps }
