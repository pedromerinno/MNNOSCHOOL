import React from 'react';
import { Company } from "@/types/company";
import { cn, getSafeTextColor } from "@/lib/utils";

interface PhaseNavigationProps {
  company: Company;
  activePhase: string;
  setActivePhase: (value: string) => void;
  children: React.ReactNode;
}

const phases = [
  { value: "type", label: "Fase 1", subtitle: "Tipo" },
  { value: "info", label: "Fase 2", subtitle: "Informações" },
];

export const PhaseNavigation: React.FC<PhaseNavigationProps> = ({
  company,
  activePhase,
  setActivePhase,
  children
}) => {
  const companyColor = company?.cor_principal || "#1EAEDB";

  return (
    <div className="flex gap-6 min-h-[600px]">
      {/* Navegação de Fases */}
      <div className="flex-shrink-0 w-64">
        <nav className="space-y-1">
          {phases.map((phase) => (
            <button
              key={phase.value}
              onClick={() => setActivePhase(phase.value)}
              className={cn(
                "w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                activePhase === phase.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              )}
              style={
                activePhase === phase.value
                  ? {
                      backgroundColor: `${companyColor}10`,
                      color: getSafeTextColor(companyColor, false)
                    }
                  : undefined
              }
            >
              <div className="flex flex-col">
                <span className="font-semibold">{phase.label}</span>
                <span className="text-xs opacity-80">{phase.subtitle}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0 bg-background rounded-lg border border-border p-6">
        {children}
      </div>
    </div>
  );
};

