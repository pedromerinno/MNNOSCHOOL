
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useCompanies } from "@/hooks/useCompanies";
import { DocumentAttachmentForm } from "@/components/documents/DocumentAttachmentForm";
import { DocumentType } from "@/types/document";

interface AddDocumentDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export const AddDocumentDialog: React.FC<AddDocumentDialogProps> = ({ open, onOpenChange }) => {
  const [loading, setLoading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  // Use hook with forced refresh to ensure companies are loaded
  const { selectedCompany, userCompanies, selectCompany, user, isLoading, forceGetUserCompanies } = useCompanies();

  console.log('[AddDocumentDialog] Companies data:', {
    userCompaniesCount: userCompanies.length,
    selectedCompany: selectedCompany?.nome || 'none',
    isLoading,
    userId: user?.id || 'no user'
  });

  // Force reload companies when dialog opens
  React.useEffect(() => {
    if (open && user?.id && userCompanies.length === 0 && !isLoading) {
      console.log('[AddDocumentDialog] Dialog opened, forcing companies refresh');
      forceGetUserCompanies(user.id);
    }
  }, [open, user?.id, userCompanies.length, isLoading, forceGetUserCompanies]);

  const handleCompanyChange = (companyId: string) => {
    const company = userCompanies.find(c => c.id === companyId);
    if (company && user?.id) {
      selectCompany(user.id, company);
    }
  };

  const handleSubmit = async (
    attachmentType: 'file' | 'link',
    fileOrUrl: File | string,
    documentType: DocumentType,
    description: string,
    name: string
  ) => {
    if (!selectedCompany?.id) {
      toast.error("Por favor, selecione uma empresa primeiro");
      return;
    }

    try {
      setLoading(true);
      // Simulate upload/save process
      await new Promise(res => setTimeout(res, 1200));
      
      const successMessage = attachmentType === 'file' ? 
        "Documento enviado com sucesso!" : 
        "Link adicionado com sucesso!";
      
      toast.success(successMessage);
      onOpenChange(false);
    } catch (e) {
      const errorMessage = attachmentType === 'file' ? 
        "Falha no envio do documento." : 
        "Falha ao adicionar o link.";
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setFileError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Documento</DialogTitle>
        </DialogHeader>
        
        <div className="mb-4">
          <Label>Empresa</Label>
          <Select 
            value={selectedCompany?.id || ""} 
            onValueChange={handleCompanyChange}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={
                isLoading ? "Carregando empresas..." : 
                userCompanies.length === 0 ? "Clique para carregar empresas" :
                "Selecione uma empresa"
              } />
            </SelectTrigger>
            <SelectContent>
              {userCompanies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  <div className="flex items-center">
                    {company.logo && (
                      <img
                        src={company.logo}
                        alt={company.nome}
                        className="h-6 w-6 object-contain rounded-full mr-2"
                      />
                    )}
                    <span>{company.nome}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {userCompanies.length === 0 && !isLoading && (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground">
                Nenhuma empresa encontrada. Verifique suas permissões.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => user?.id && forceGetUserCompanies(user.id)}
                className="mt-1"
              >
                Tentar carregar novamente
              </Button>
            </div>
          )}
        </div>

        <DocumentAttachmentForm
          onSubmit={handleSubmit}
          isUploading={loading}
          fileError={fileError}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
};
