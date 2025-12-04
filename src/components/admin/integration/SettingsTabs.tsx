
import React, { useEffect } from 'react';
import { PhaseNavigation } from './PhaseNavigation';
import { SettingsTabsProps } from './settings/types';
import { InfoForm } from './form/InfoForm';
import { TypeForm } from './form/TypeForm';

export const SettingsTabs: React.FC<SettingsTabsProps> = ({
  company,
  activeTab,
  setActiveTab,
  handleFormSubmit,
  isSaving
}) => {
  // Garantir que a fase padrão seja "type" se não houver uma ativa
  useEffect(() => {
    if (!activeTab || !['type', 'info'].includes(activeTab)) {
      setActiveTab('type');
    }
  }, [activeTab, setActiveTab]);

  // Implementação atualizada do manipulador de fases
  const handlePhaseChange = (value: string) => {
    setActiveTab(value);
    
    // Atualiza o estado da URL sem causar navegação
    if (typeof window !== 'undefined') {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('subtab', value);
      window.history.replaceState({}, '', currentUrl.toString());
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "type":
        return (
          <TypeForm
            company={company}
            onSubmit={handleFormSubmit}
            isSaving={isSaving}
          />
        );
      case "info":
        return (
          <InfoForm
            company={company}
            onSubmit={handleFormSubmit}
            isSaving={isSaving}
          />
        );
      default:
        return (
          <TypeForm
            company={company}
            onSubmit={handleFormSubmit}
            isSaving={isSaving}
          />
        );
    }
  };

  return (
    <PhaseNavigation
      company={company}
      activePhase={activeTab || 'type'}
      setActivePhase={handlePhaseChange}
    >
      {renderContent()}
    </PhaseNavigation>
  );
};
