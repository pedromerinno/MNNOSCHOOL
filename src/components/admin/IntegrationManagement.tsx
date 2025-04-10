
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Building, Video, FileText, Key, Users } from "lucide-react";
import { useCompanies } from "@/hooks/useCompanies";
import { Company } from "@/types/company";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CompanyIntegrationForm } from './integration/CompanyIntegrationForm';
import { IntegrationVideosManager } from './integration/IntegrationVideosManager';
import { JobRolesManager } from './integration/JobRolesManager';
import { AccessManagement } from './integration/AccessManagement';

export const IntegrationManagement: React.FC = () => {
  const { companies, isLoading, fetchCompanies } = useCompanies();
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const hasLoadedCompanies = useRef(false);

  // Fetch companies only once on mount
  useEffect(() => {
    const loadCompanies = async () => {
      if (!hasLoadedCompanies.current && !isLoading) {
        console.log("Loading companies in IntegrationManagement - Initial Load");
        hasLoadedCompanies.current = true;
        await fetchCompanies();
      }
    };
    loadCompanies();
  }, [fetchCompanies, isLoading]);

  // Set the first company as selected if none is selected yet
  useEffect(() => {
    if (companies.length > 0 && !selectedCompany) {
      console.log("Setting initial selected company:", companies[0].nome);
      setSelectedCompany(companies[0]);
    }
  }, [companies, selectedCompany]);

  const handleCompanyChange = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    if (company) {
      console.log("Company changed to:", company.nome);
      setSelectedCompany(company);
    }
  };

  const handleFormSubmit = async (formData: any) => {
    if (!selectedCompany) {
      toast.error("Nenhuma empresa selecionada");
      return;
    }
    
    setIsSaving(true);
    
    try {
      console.log("Saving integration info for company:", selectedCompany.nome);
      
      const { error } = await supabase
        .from('empresas')
        .update(formData)
        .eq('id', selectedCompany.id);
        
      if (error) throw error;
      
      // Atualizar o objeto da empresa selecionada localmente
      setSelectedCompany({
        ...selectedCompany,
        ...formData
      });
      
      toast.success("Informações de integração atualizadas com sucesso");
      
      // Disparar evento para atualizar dados da empresa em outros componentes
      window.dispatchEvent(new Event('company-relation-changed'));
      
    } catch (error: any) {
      console.error("Erro ao salvar informações:", error);
      toast.error(`Erro ao salvar: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && companies.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-1">Gerenciar Conteúdo de Integração</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Edite as informações de integração exibidas para cada empresa
          </p>
        </div>
        
        <div className="w-full md:w-72">
          <Select 
            value={selectedCompany?.id} 
            onValueChange={handleCompanyChange}
            disabled={companies.length === 0}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione uma empresa" />
            </SelectTrigger>
            <SelectContent>
              {companies.map(company => (
                <SelectItem key={company.id} value={company.id}>
                  {company.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedCompany ? (
        <Card>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b">
                <TabsList className="bg-gray-50 dark:bg-gray-900 w-full justify-start rounded-none p-0 h-auto">
                  <TabsTrigger 
                    value="info" 
                    className="flex items-center py-3 px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
                    style={{
                      borderColor: activeTab === "info" ? selectedCompany?.cor_principal || "#1EAEDB" : "transparent"
                    }}
                  >
                    <Building className="h-4 w-4 mr-2" />
                    Informações da Empresa
                  </TabsTrigger>
                  <TabsTrigger 
                    value="videos" 
                    className="flex items-center py-3 px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
                    style={{
                      borderColor: activeTab === "videos" ? selectedCompany?.cor_principal || "#1EAEDB" : "transparent"
                    }}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Vídeos
                  </TabsTrigger>
                  <TabsTrigger 
                    value="cargo" 
                    className="flex items-center py-3 px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
                    style={{
                      borderColor: activeTab === "cargo" ? selectedCompany?.cor_principal || "#1EAEDB" : "transparent"
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Cargos
                  </TabsTrigger>
                  <TabsTrigger 
                    value="access" 
                    className="flex items-center py-3 px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
                    style={{
                      borderColor: activeTab === "access" ? selectedCompany?.cor_principal || "#1EAEDB" : "transparent"
                    }}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Acessos
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="p-6">
                <TabsContent value="info" className="m-0">
                  <CompanyIntegrationForm 
                    company={selectedCompany}
                    onSubmit={handleFormSubmit}
                    isSaving={isSaving}
                  />
                </TabsContent>
                <TabsContent value="videos" className="m-0">
                  <IntegrationVideosManager company={selectedCompany} />
                </TabsContent>
                <TabsContent value="cargo" className="m-0">
                  <JobRolesManager company={selectedCompany} />
                </TabsContent>
                <TabsContent value="access" className="m-0">
                  <AccessManagement company={selectedCompany} />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-medium mb-2">Nenhuma empresa selecionada</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Selecione uma empresa para gerenciar seu conteúdo de integração.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
