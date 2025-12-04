import React from 'react';
import { useCompanies } from '@/hooks/useCompanies';
import { AccessManagement } from './integration/AccessManagement';
import { AdminPageTitle } from './AdminPageTitle';
import { Key, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const CompanyAccessPage: React.FC = () => {
  const { selectedCompany, isLoading } = useCompanies();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <AdminPageTitle
          title="Senhas e Acessos"
          description="Gerencie as senhas e acessos da empresa"
          size="xl"
        />
        <Card>
          <CardContent className="p-6 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <span className="text-gray-600">Carregando...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!selectedCompany) {
    return (
      <div className="space-y-6">
        <AdminPageTitle
          title="Senhas e Acessos"
          description="Gerencie as senhas e acessos da empresa"
          size="xl"
        />
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">Nenhuma empresa selecionada</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageTitle
        title="Senhas e Acessos"
        description={`Gerenciar senhas e acessos de ${selectedCompany.nome}`}
        icon={Key}
        size="xl"
      />
      <AccessManagement 
        companyId={selectedCompany.id} 
        companyColor={selectedCompany.cor_principal}
      />
    </div>
  );
};

