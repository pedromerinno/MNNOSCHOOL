
import { useEffect, useCallback } from 'react';
import { Company } from '@/types/company';

interface CompanySyncEvent {
  type: 'company-updated' | 'company-name-changed' | 'company-selected' | 'company-data-updated';
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
        localStorage.removeItem(`notices_${companyId}`);
        localStorage.removeItem(`feedbacks_${companyId}`);
        localStorage.removeItem(`videos_${companyId}`);
        localStorage.removeItem(`integration_${companyId}`);
      }
      
      // Limpar caches globais
      localStorage.removeItem('selectedCompanyName');
      localStorage.removeItem('selectedCompanyLogo');
      localStorage.removeItem('selectedCompany');
      localStorage.removeItem('companiesCache');
      localStorage.removeItem('userCompaniesCache');
      
      console.log('[CompanySync] Cache limpo para empresa:', companyId || 'todas');
    } catch (error) {
      console.error('[CompanySync] Erro ao limpar cache:', error);
    }
  }, []);

  // Função para forçar atualização em todos os componentes
  const forceCompanyUpdate = useCallback((company: Company) => {
    try {
      // Limpar caches primeiro
      clearCompanyCache(company.id);
      
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
        },
        {
          type: 'company-data-updated',
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

      // Eventos adicionais para força total refresh
      window.dispatchEvent(new Event('company-relation-changed'));
      window.dispatchEvent(new Event('force-reload-companies'));
      window.dispatchEvent(new Event('force-company-refresh'));
      
      console.log('[CompanySync] Forçada atualização completa para empresa:', company.nome);
    } catch (error) {
      console.error('[CompanySync] Erro ao forçar atualização:', error);
    }
  }, [clearCompanyCache]);

  // Função para sincronizar dados da empresa
  const syncCompanyData = useCallback((company: Company) => {
    clearCompanyCache(company.id);
    forceCompanyUpdate(company);
    
    // Dispatch eventos específicos para integração
    window.dispatchEvent(new CustomEvent('integration-data-updated', {
      detail: { company }
    }));
    
    // Recarregar dados dependentes
    setTimeout(() => {
      window.dispatchEvent(new Event('reload-company-dependent-data'));
    }, 100);
    
  }, [clearCompanyCache, forceCompanyUpdate]);

  return {
    clearCompanyCache,
    forceCompanyUpdate,
    syncCompanyData
  };
};
