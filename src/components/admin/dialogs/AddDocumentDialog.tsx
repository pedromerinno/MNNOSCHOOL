
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useCompanies } from "@/hooks/useCompanies";

interface AddDocumentDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export const AddDocumentDialog: React.FC<AddDocumentDialogProps> = ({ open, onOpenChange }) => {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Companies logic - using userCompanies instead of companies
  const { selectedCompany, userCompanies, selectCompany, user, isLoading } = useCompanies();

  console.log('[AddDocumentDialog] Companies data:', {
    userCompaniesCount: userCompanies.length,
    selectedCompany: selectedCompany?.nome || 'none',
    isLoading,
    userId: user?.id || 'no user'
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleCompanyChange = (companyId: string) => {
    const company = userCompanies.find(c => c.id === companyId);
    if (company && user?.id) {
      selectCompany(user.id, company);
    }
  };

  const handleUpload = async () => {
    try {
      setLoading(true);
      await new Promise(res => setTimeout(res, 1200));
      toast.success("Documento enviado com sucesso!");
      setFile(null);
      setDescription("");
      onOpenChange(false);
    } catch (e) {
      toast.error("Falha no envio.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Documento</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <Label>Empresa</Label>
          <Select 
            value={selectedCompany?.id || ""} 
            onValueChange={handleCompanyChange}
            disabled={isLoading || userCompanies.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder={
                isLoading ? "Carregando empresas..." : 
                userCompanies.length === 0 ? "Nenhuma empresa disponível" :
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
            <p className="text-sm text-muted-foreground mt-1">
              Nenhuma empresa encontrada. Verifique suas permissões.
            </p>
          )}
        </div>
        <div className="space-y-3">
          <div>
            <Input type="file" onChange={handleFile} />
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleUpload} disabled={loading || !file}>
            {loading ? "Enviando..." : "Adicionar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
