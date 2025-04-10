
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { useCompanies } from "@/hooks/useCompanies"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        beta: "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

// Add a company-themed badge that dynamically uses the company color
function CompanyThemedBadge({ 
  className, 
  variant = "default", 
  ...props 
}: BadgeProps) {
  const { selectedCompany } = useCompanies();
  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";
  
  // Set custom styles for company colors
  const style: React.CSSProperties = {};
  
  if (variant === "default" || variant === "beta") {
    // For default and beta variants, apply company colors
    style.backgroundColor = `${companyColor}20`; // Light background (12.5% opacity)
    style.color = companyColor;
    style.borderColor = `${companyColor}30`; // Slightly darker border (18.75% opacity)
  }
  
  return (
    <div 
      className={cn(badgeVariants({ variant }), className)} 
      style={style}
      {...props} 
    />
  )
}

export { Badge, CompanyThemedBadge, badgeVariants }
