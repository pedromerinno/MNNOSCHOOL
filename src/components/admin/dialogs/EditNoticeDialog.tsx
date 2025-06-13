
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCompanyNotices } from "@/hooks/useCompanyNotices";
import { Notice } from "@/hooks/useNotifications";
import { toast } from "sonner";

interface EditNoticeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notice: Notice | null;
  companyId: string;
  onNoticeUpdated?: (updatedNotice: Notice) => void;
}

export const EditNoticeDialog: React.FC<EditNoticeDialogProps> = ({
  open,
  onOpenChange,
  notice,
  companyId,
  onNoticeUpdated
}) => {
  const { updateNotice, isLoading } = useCompanyNotices();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'geral',
  });

  useEffect(() => {
    if (notice) {
      setFormData({
        title: notice.title,
        content: notice.content,
        type: notice.type,
      });
    }
  }, [notice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!notice) return;
    
    const success = await updateNotice(notice.id, {
      ...formData,
      companies: [companyId]
    });
    
    if (success && onNoticeUpdated) {
      // Notify parent component about the update
      const updatedNotice = {
        ...notice,
        ...formData,
        updated_at: new Date().toISOString()
      };
      onNoticeUpdated(updatedNotice);
    }
    
    if (success) {
      onOpenChange(false);
      setFormData({ title: '', content: '', type: 'geral' });
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setFormData({ title: '', content: '', type: 'geral' });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Aviso</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Digite o título do aviso"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="geral">Geral</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
                <SelectItem value="informativo">Informativo</SelectItem>
                <SelectItem value="evento">Evento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Conteúdo</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Digite o conteúdo do aviso"
              rows={6}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
