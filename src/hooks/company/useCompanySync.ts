
import { useEffect, useCallback } from 'react';
import { Company } from '@/types/company';

interface CompanySyncEvent {
  type: 'company-updated' | 'company-name-changed' | 'company-selected';
  company: Company;
  companyId: string;
  newName?: string;
}

export const useCompanySync = () => {
  // Função para limpar todos os caches relacionados à empresa
  const clearCompanyCache = useCallback((companyId?: string) => {
    try {
      // Limpar caches específicos da empresa
      if (companyId) {
        localStorage.removeItem(`company_${companyId}_cache`);
        localStorage.removeItem(`company_${companyId}_name`);
      }
      
      // Limpar caches globais
      localStorage.removeItem('selectedCompanyName');
      localStorage.removeItem('selectedCompanyLogo');
      localStorage.removeItem('selectedCompany');
      
      console.log('[CompanySync] Cache limpo para empresa:', companyId || 'todas');
    } catch (error) {
      console.error('[CompanySync] Erro ao limpar cache:', error);
    }
  }, []);

  // Função para forçar atualização em todos os componentes
  const forceCompanyUpdate = useCallback((company: Company) => {
    try {
      // Atualizar localStorage imediatamente
      localStorage.setItem('selectedCompany', JSON.stringify(company));
      localStorage.setItem('selectedCompanyId', company.id);
      localStorage.setItem('selectedCompanyName', company.nome);
      
      if (company.logo) {
        localStorage.setItem('selectedCompanyLogo', company.logo);
      }
      
      // Dispatch eventos para forçar atualização
      const events: CompanySyncEvent[] = [
        {
          type: 'company-updated',
          company,
          companyId: company.id
        },
        {
          type: 'company-name-changed',
          company,
          companyId: company.id,
          newName: company.nome
        },
        {
          type: 'company-selected',
          company,
          companyId: company.id
        }
      ];

      events.forEach(eventData => {
        const event = new CustomEvent(eventData.type, {
          detail: {
            company: eventData.company,
            companyId: eventData.companyId,
            newName: eventData.newName
          }
        });
        window.dispatchEvent(event);
      });

      console.log('[CompanySync] Forçada atualização para empresa:', company.nome);
    } catch (error) {
      console.error('[CompanySync] Erro ao forçar atualização:', error);
    }
  }, []);

  // Função para sincronizar dados da empresa
  const syncCompanyData = useCallback((company: Company) => {
    clearCompanyCache(company.id);
    forceCompanyUpdate(company);
  }, [clearCompanyCache, forceCompanyUpdate]);

  return {
    clearCompanyCache,
    forceCompanyUpdate,
    syncCompanyData
  };
};
