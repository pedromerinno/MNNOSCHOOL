
import React from 'react';
import { Tabs, TabsList } from "@/components/ui/tabs";
import { Building, Video, FileText, Users, Key, Book, Image } from "lucide-react";
import { SettingsTabTrigger } from './settings/SettingsTabTrigger';
import { SettingsTabContent } from './settings/SettingsTabContent';
import { SettingsTabsProps } from './settings/types';

export const SettingsTabs: React.FC<SettingsTabsProps> = ({
  company,
  activeTab,
  setActiveTab,
  handleFormSubmit,
  isSaving
}) => {
  const tabs = [
    { value: "info", label: "Informações da Empresa", icon: Building },
    { value: "videos", label: "Vídeos", icon: Video },
    { value: "cargo", label: "Cargos", icon: FileText },
    { value: "access", label: "Acessos", icon: Key },
    { value: "collaborators", label: "Colaboradores", icon: Users },
    { value: "courses", label: "Cursos", icon: Book },
    { value: "background", label: "Background", icon: Image },
  ];

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="border-b">
        <TabsList className="bg-gray-50 dark:bg-gray-900 w-full justify-start rounded-none p-0 h-auto">
          {tabs.map((tab) => (
            <SettingsTabTrigger
              key={tab.value}
              value={tab.value}
              icon={tab.icon}
              label={tab.label}
              activeTab={activeTab}
              companyColor={company?.cor_principal}
            />
          ))}
        </TabsList>
      </div>
      
      <div className="p-6">
        {tabs.map((tab) => (
          <SettingsTabContent
            key={tab.value}
            value={tab.value}
            company={company}
            onSubmit={handleFormSubmit}
            isSaving={isSaving}
          />
        ))}
      </div>
    </Tabs>
  );
};
