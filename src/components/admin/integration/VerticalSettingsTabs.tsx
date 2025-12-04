
import React, { useState } from 'react';
import { Company } from "@/types/company";
import { cn, getSafeTextColor } from "@/lib/utils";

interface VerticalSettingsTabsProps {
  company: Company;
  activeTab: string;
  setActiveTab: (value: string) => void;
  children: React.ReactNode;
}

const tabs = [
  { value: "info", label: "Informações" },
  { value: "identity", label: "Identidade Visual" },
  { value: "video", label: "Vídeo Institucional" },
  { value: "playlist", label: "Playlist de Vídeos" },
];

export const VerticalSettingsTabs: React.FC<VerticalSettingsTabsProps> = ({
  company,
  activeTab,
  setActiveTab,
  children
}) => {
  const companyColor = company?.cor_principal || "#1EAEDB";

  return (
    <div className="flex gap-6 min-h-[600px]">
      {/* Tabs Verticais */}
      <div className="flex-shrink-0 w-64">
        <nav className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                activeTab === tab.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              )}
              style={
                activeTab === tab.value
                  ? {
                      backgroundColor: `${companyColor}10`,
                      color: getSafeTextColor(companyColor, false)
                    }
                  : undefined
              }
            >
              {tab.label}
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

