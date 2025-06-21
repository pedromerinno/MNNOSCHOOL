
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanyDocumentUploadForm } from "./CompanyDocumentUploadForm";
import { CompanyDocumentList } from "./CompanyDocumentList";
import { CompanyDocument, CompanyDocumentType } from "@/types/company-document";
import { JobRole } from "@/types/job-roles";
import { FileText, Shield, ScrollText, Briefcase, Archive, Book, Clipboard, GraduationCap } from "lucide-react";
import { useCompanies } from "@/hooks/useCompanies";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface CompanyDocumentTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  documents: CompanyDocument[];
  uploadOpen: boolean;
  setUploadOpen: (open: boolean) => void;
  isUploading: boolean;
  onUpload: (
    attachmentType: 'file' | 'link',
    fileOrUrl: File | string,
    documentType: CompanyDocumentType,
    description: string,
    name: string,
    selectedJobRoles: string[]
  ) => Promise<boolean>;
  onDownload: (document: CompanyDocument) => Promise<void>;
  onPreview: (document: CompanyDocument) => Promise<void>;
  onDelete: (document: CompanyDocument) => Promise<void>;
  canDeleteDocument: (document: CompanyDocument) => boolean;
}

export const CompanyDocumentTabs: React.FC<CompanyDocumentTabsProps> = ({
  activeTab,
  setActiveTab,
  documents,
  uploadOpen,
  setUploadOpen,
  isUploading,
  onUpload,
  onDownload,
  onPreview,
  onDelete,
  canDeleteDocument
}) => {
  const { selectedCompany } = useCompanies();
  const { userProfile } = useAuth();
  const [availableRoles, setAvailableRoles] = useState<JobRole[]>([]);
  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";

  // Buscar cargos disponíveis
  useEffect(() => {
    const fetchRoles = async () => {
      if (!selectedCompany?.id) return;

      try {
        const { data: roles, error } = await supabase
          .from('job_roles')
          .select('*')
          .eq('company_id', selectedCompany.id)
          .order('order_index', { ascending: true });

        if (error) {
          console.error('Error fetching roles:', error);
          return;
        }

        setAvailableRoles(roles || []);
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };

    fetchRoles();
  }, [selectedCompany?.id]);

  const filterDocuments = (type?: string) => {
    if (!type || type === "all") return documents;
    return documents.filter(doc => doc.document_type === type);
  };

  const tabs = [
    {
      value: "all",
      label: "Todos",
      icon: FileText
    },
    {
      value: "confidentiality_agreement",
      label: "Confidencialidade",
      icon: Shield
    },
    {
      value: "company_policy",
      label: "Políticas",
      icon: ScrollText
    },
    {
      value: "employment_contract",
      label: "Contratos",
      icon: Briefcase
    },
    {
      value: "company_manual",
      label: "Manuais",
      icon: Book
    },
    {
      value: "procedures",
      label: "Procedimentos",
      icon: Clipboard
    },
    {
      value: "training_materials",
      label: "Treinamentos",
      icon: GraduationCap
    },
    {
      value: "other",
      label: "Outros",
      icon: Archive
    }
  ];

  const canUploadDocuments = userProfile?.is_admin || userProfile?.super_admin;

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full rounded-2xl p-1.5 gap-2 bg-gray-100/0">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-2 rounded-xl py-4 px-3 transition-colors text-xs lg:text-sm"
              style={{
                backgroundColor: activeTab === tab.value ? `${companyColor}10` : undefined,
                borderColor: activeTab === tab.value ? companyColor : undefined,
                color: activeTab === tab.value ? companyColor : undefined
              }}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-6 mb-16 space-y-8">
          {canUploadDocuments && (
            <CompanyDocumentUploadForm
              open={uploadOpen}
              onOpenChange={setUploadOpen}
              onUpload={onUpload}
              isUploading={isUploading}
              availableRoles={availableRoles}
            />
          )}

          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="m-0">
              <CompanyDocumentList
                documents={filterDocuments(tab.value === "all" ? undefined : tab.value)}
                onDownload={onDownload}
                onPreview={onPreview}
                onDelete={onDelete}
                canDeleteDocument={canDeleteDocument}
              />
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
};
