
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentUploadForm } from "./DocumentUploadForm";
import { DocumentList } from "./DocumentList";
import { UserDocument, DocumentType } from "@/types/document";
import { FileText, Shield, ScrollText, Briefcase, Archive } from "lucide-react";
import { useCompanies } from "@/hooks/useCompanies";
import { useState } from "react";

interface DocumentTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  documents: UserDocument[];
  uploadOpen: boolean;
  setUploadOpen: (open: boolean) => void;
  isUploading: boolean;
  onUpload: (
    attachmentType: 'file' | 'link',
    fileOrUrl: File | string,
    documentType: DocumentType,
    description: string,
    name: string
  ) => Promise<boolean>;
  onDownload: (document: UserDocument) => Promise<void>;
  onPreview: (document: UserDocument) => Promise<void>;
  onDelete: (document: UserDocument) => Promise<void>;
  canDeleteDocument: (document: UserDocument) => boolean;
}

export const DocumentTabs = ({
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
}: DocumentTabsProps) => {
  const { selectedCompany } = useCompanies();
  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";

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
      value: "other",
      label: "Outros",
      icon: Archive
    }
  ];

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full rounded-2xl p-1.5 gap-2 bg-gray-100/0">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-2 rounded-xl py-4 px-6 transition-colors"
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

        <div className="mt-10 mb-16 space-y-8">
          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="m-0">
              <DocumentUploadForm
                open={uploadOpen}
                onOpenChange={setUploadOpen}
                onUpload={onUpload}
                isUploading={isUploading}
              />
              <div className="mt-6">
                <DocumentList
                  documents={filterDocuments(tab.value === "all" ? undefined : tab.value)}
                  onDownload={onDownload}
                  onPreview={onPreview}
                  onDelete={onDelete}
                  canDeleteDocument={canDeleteDocument}
                />
              </div>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
};
