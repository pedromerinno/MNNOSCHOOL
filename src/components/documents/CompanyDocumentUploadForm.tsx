
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CompanyDocumentType, COMPANY_DOCUMENT_TYPE_LABELS } from "@/types/company-document";
import { JobRole } from "@/types/job-roles";
import { useCompanies } from "@/hooks/useCompanies";
import { DocumentAttachmentForm } from './DocumentAttachmentForm';
import { Plus, Building } from 'lucide-react';

interface CompanyDocumentUploadFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (
    attachmentType: 'file' | 'link',
    fileOrUrl: File | string,
    documentType: CompanyDocumentType,
    description: string,
    name: string,
    selectedJobRoles: string[]
  ) => Promise<boolean>;
  isUploading: boolean;
  availableRoles: JobRole[];
}

export const CompanyDocumentUploadForm: React.FC<CompanyDocumentUploadFormProps> = ({
  open,
  onOpenChange,
  onUpload,
  isUploading,
  availableRoles
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [documentType, setDocumentType] = useState<CompanyDocumentType>('other');
  const [attachmentType, setAttachmentType] = useState<'file' | 'link'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  
  const { selectedCompany } = useCompanies();
  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";

  const resetForm = () => {
    setName('');
    setDescription('');
    setDocumentType('other');
    setAttachmentType('file');
    setFile(null);
    setLinkUrl('');
    setSelectedRoles([]);
    setIsPublic(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      return;
    }

    if (attachmentType === 'file' && !file) {
      return;
    }

    if (attachmentType === 'link' && !linkUrl.trim()) {
      return;
    }

    const fileOrUrl = attachmentType === 'file' ? file! : linkUrl;
    const rolesToSubmit = isPublic ? [] : selectedRoles;
    
    const success = await onUpload(attachmentType, fileOrUrl, documentType, description, name, rolesToSubmit);
    
    if (success) {
      resetForm();
      onOpenChange(false);
    }
  };

  const handleRoleToggle = (roleId: string, checked: boolean) => {
    if (checked) {
      setSelectedRoles(prev => [...prev, roleId]);
    } else {
      setSelectedRoles(prev => prev.filter(id => id !== roleId));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button 
          className="mb-6"
          style={{ backgroundColor: companyColor, borderColor: companyColor }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Documento da Empresa
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" style={{ color: companyColor }} />
            Adicionar Documento da Empresa
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Documento *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Manual do Colaborador"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="documentType">Tipo de Documento</Label>
              <Select value={documentType} onValueChange={(value: CompanyDocumentType) => setDocumentType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(COMPANY_DOCUMENT_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o conteúdo do documento..."
              rows={3}
            />
          </div>

          <DocumentAttachmentForm
            attachmentType={attachmentType}
            onAttachmentTypeChange={setAttachmentType}
            file={file}
            onFileChange={setFile}
            linkUrl={linkUrl}
            onLinkUrlChange={setLinkUrl}
          />

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPublic"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
              <Label htmlFor="isPublic" className="text-sm">
                Disponível para todos os colaboradores da empresa
              </Label>
            </div>

            {!isPublic && availableRoles.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Restringir acesso aos cargos:</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {availableRoles.map((role) => (
                    <div key={role.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`role-${role.id}`}
                        checked={selectedRoles.includes(role.id)}
                        onCheckedChange={(checked) => handleRoleToggle(role.id, checked as boolean)}
                      />
                      <Label htmlFor={`role-${role.id}`} className="text-sm">
                        {role.title}
                      </Label>
                    </div>
                  ))}
                </div>
                {selectedRoles.length === 0 && (
                  <p className="text-sm text-orange-600">
                    Selecione pelo menos um cargo ou marque como público
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isUploading || !name.trim() || 
                (attachmentType === 'file' && !file) || 
                (attachmentType === 'link' && !linkUrl.trim()) ||
                (!isPublic && selectedRoles.length === 0)}
              style={{ backgroundColor: companyColor, borderColor: companyColor }}
            >
              {isUploading ? 'Criando...' : 'Criar Documento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
