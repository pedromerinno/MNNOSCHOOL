
import React from 'react';
import { Tabs, TabsList } from "@/components/ui/tabs";
import { Book, Briefcase, Key, Users, Video, Building } from "lucide-react";
import { SettingsTabTrigger } from './settings/SettingsTabTrigger';
import { SettingsTabContent } from './settings/SettingsTabContent';
import { SettingsTabsProps } from './settings/types';
import { useAuth } from '@/contexts/AuthContext';

export const SettingsTabs: React.FC<SettingsTabsProps> = ({
  company,
  activeTab,
  setActiveTab,
  handleFormSubmit,
  isSaving
}) => {
  // Tab definitions seguindo a ordem e nomes passados, com ícones do padrão do painel admin
  const tabs = [{
    value: "info",
    label: "Informações",
    icon: Building
  }, {
    value: "videos",
    label: "Vídeos",
    icon: Video
  }, {
    value: "courses",
    label: "Cursos",
    icon: Book
  }, {
    value: "cargo",
    label: "Cargos",
    icon: Briefcase
  }, {
    value: "access",
    label: "Senhas e Acessos",
    icon: Key
  }, {
    value: "collaborators",
    label: "Colaboradores",
    icon: Users
  }];
  
  // Use preventive click handler to stop tab changes from reloading the page
  const handleTabChange = (value: string) => {
    // Prevent default behavior that might cause page reload
    setActiveTab(value);
    
    // Update URL to reflect tab change without page reload
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('subtab', value);
    window.history.pushState({}, '', newUrl);
  };
  
  return <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <div className="border-b border-gray-100 dark:border-gray-800 py-2 px-2 bg-transparent">
        <TabsList className="flex gap-2 rounded-2xl p-1.5 bg-transparent dark:bg-transparent w-full justify-start">
          {tabs.map(tab => <SettingsTabTrigger key={tab.value} value={tab.value} icon={tab.icon} label={tab.label} activeTab={activeTab} companyColor={company?.cor_principal} />)}
        </TabsList>
      </div>
      <div className="p-4 px-[30px] py-[30px]">
        {tabs.map(tab => <SettingsTabContent key={tab.value} value={tab.value} company={company} onSubmit={handleFormSubmit} isSaving={isSaving} />)}
      </div>
    </Tabs>;
};
