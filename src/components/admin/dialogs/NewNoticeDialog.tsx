
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useCompanies } from "@/hooks/useCompanies";

interface NewNoticeDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export const NewNoticeDialog: React.FC<NewNoticeDialogProps> = ({ open, onOpenChange }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  // Companies logic
  const { selectedCompany, userCompanies, selectCompany, user } = useCompanies();

  const handleCompanyChange = (companyId: string) => {
    const company = userCompanies.find(c => c.id === companyId);
    if (company && user?.id) {
      selectCompany(user.id, company);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    await new Promise(res => setTimeout(res, 1200));
    toast.success("Aviso criado com sucesso.");
    setTitle('');
    setContent('');
    onOpenChange(false);
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Aviso</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <Label>Empresa</Label>
          <Select 
            value={selectedCompany?.id || ""} 
            onValueChange={handleCompanyChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma empresa" />
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
        </div>
        <div className="space-y-3 py-2">
          <div>
            <Label>Título</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <Label>Conteúdo</Label>
            <Textarea value={content} onChange={e => setContent(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Salvando..." : "Adicionar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
