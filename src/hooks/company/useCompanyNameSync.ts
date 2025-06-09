
import { useState, useEffect, useCallback } from 'react';
import { Company } from '@/types/company';

interface UseCompanyNameSyncProps {
  selectedCompany: Company | null;
  fallbackName?: string;
}

export const useCompanyNameSync = ({ 
  selectedCompany, 
  fallbackName = "merinno" 
}: UseCompanyNameSyncProps) => {
  const [displayName, setDisplayName] = useState<string>(fallbackName);

  // Função para atualizar o nome com logs
  const updateDisplayName = useCallback((newName: string, source: string) => {
    if (newName && newName !== displayName) {
      console.log(`[CompanyNameSync] Atualizando nome de "${displayName}" para "${newName}" (fonte: ${source})`);
      setDisplayName(newName);
      
      // Atualizar cache
      try {
        localStorage.setItem('selectedCompanyName', newName);
        console.log('[CompanyNameSync] Cache atualizado com novo nome:', newName);
      } catch (error) {
        console.error('[CompanyNameSync] Erro ao salvar no cache:', error);
      }
    }
  }, [displayName]);

  // Função para forçar atualização
  const forceUpdate = useCallback(() => {
    if (selectedCompany?.nome) {
      console.log('[CompanyNameSync] Forçando atualização para:', selectedCompany.nome);
      setDisplayName(selectedCompany.nome);
      localStorage.setItem('selectedCompanyName', selectedCompany.nome);
    }
  }, [selectedCompany?.nome]);

  // Inicializar com dados disponíveis
  useEffect(() => {
    if (selectedCompany?.nome) {
      updateDisplayName(selectedCompany.nome, 'selectedCompany');
    } else {
      // Tentar carregar do cache
      try {
        const cachedName = localStorage.getItem('selectedCompanyName');
        if (cachedName && cachedName !== displayName) {
          updateDisplayName(cachedName, 'cache');
        }
      } catch (error) {
        console.error('[CompanyNameSync] Erro ao carregar do cache:', error);
      }
    }
  }, [selectedCompany?.nome, updateDisplayName, displayName]);

  // Listener para eventos de atualização
  useEffect(() => {
    const handleCompanyUpdate = (event: CustomEvent) => {
      const { company } = event.detail;
      console.log('[CompanyNameSync] Evento company-updated recebido:', company?.nome);
      if (company?.nome) {
        updateDisplayName(company.nome, 'company-updated');
      }
    };

    const handleNameChange = (event: CustomEvent) => {
      const { newName, companyId } = event.detail;
      console.log('[CompanyNameSync] Evento name-changed recebido:', newName);
      if (newName && (!selectedCompany || selectedCompany.id === companyId)) {
        updateDisplayName(newName, 'name-changed');
      }
    };

    const handleCompanySelected = (event: CustomEvent) => {
      const { company } = event.detail;
      console.log('[CompanyNameSync] Evento company-selected recebido:', company?.nome);
      if (company?.nome) {
        updateDisplayName(company.nome, 'company-selected');
      }
    };

    const handleForceRefresh = (event: CustomEvent) => {
      const { company } = event.detail;
      console.log('[CompanyNameSync] Evento force-company-refresh recebido:', company?.nome);
      if (company?.nome) {
        setDisplayName(company.nome);
        localStorage.setItem('selectedCompanyName', company.nome);
      }
    };

    // Adicionar listeners
    window.addEventListener('company-updated', handleCompanyUpdate as EventListener);
    window.addEventListener('company-name-changed', handleNameChange as EventListener);
    window.addEventListener('company-selected', handleCompanySelected as EventListener);
    window.addEventListener('force-company-refresh', handleForceRefresh as EventListener);

    return () => {
      window.removeEventListener('company-updated', handleCompanyUpdate as EventListener);
      window.removeEventListener('company-name-changed', handleNameChange as EventListener);
      window.removeEventListener('company-selected', handleCompanySelected as EventListener);
      window.removeEventListener('force-company-refresh', handleForceRefresh as EventListener);
    };
  }, [selectedCompany?.id, updateDisplayName]);

  return {
    displayName,
    updateDisplayName,
    forceUpdate
  };
};
