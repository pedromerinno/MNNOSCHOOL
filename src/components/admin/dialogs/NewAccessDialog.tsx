
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface NewAccessDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export const NewAccessDialog: React.FC<NewAccessDialogProps> = ({ open, onOpenChange }) => {
  const [tool_name, setToolName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      await new Promise(res => setTimeout(res, 1200));
      toast.success("Acesso criado com sucesso.");
      onOpenChange(false);
      setToolName("");
      setUsername("");
      setPassword("");
      setUrl("");
      setNotes("");
    } catch (e) {
      toast.error("Erro ao criar acesso.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Acesso</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <Label>Nome da Ferramenta</Label>
            <Input value={tool_name} onChange={e => setToolName(e.target.value)} />
          </div>
          <div>
            <Label>Usuário</Label>
            <Input value={username} onChange={e => setUsername(e.target.value)} />
          </div>
          <div>
            <Label>Senha</Label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div>
            <Label>URL</Label>
            <Input value={url} onChange={e => setUrl(e.target.value)} />
          </div>
          <div>
            <Label>Observações</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} />
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
