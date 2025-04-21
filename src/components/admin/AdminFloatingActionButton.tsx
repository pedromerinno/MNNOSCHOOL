
import React, { useState } from "react";
import { Plus, FilePlus, Link, BookPlus, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Novo Acesso - state simplificado
function NewAccessDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (v: boolean) => void }) {
  // Campos necessários
  const [tool_name, setToolName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      // Simulações: aqui você deveria integrar com a função de inserir acesso (como em AccessManagement)
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
}

// Adicionar documento - state simplificado
function AddDocumentDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (v: boolean) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };
  const handleUpload = async () => {
    try {
      setLoading(true);
      // Aqui você deveria chamar lógica de upload, como em DocumentUploadDialog
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
}

// Opções do FAB com ações
const FAB_OPTIONS = [
  {
    label: "Novo Curso",
    icon: <BookPlus className="h-5 w-5 mr-2" />,
    action: () => window.open("/admin?tab=allcourses", "_self"),
  },
  {
    label: "Novo Aviso",
    icon: <MessageSquarePlus className="h-5 w-5 mr-2" />,
    action: () => window.open("/community", "_self"),
  },
  {
    label: "Nova Discussão",
    icon: <MessageSquarePlus className="h-5 w-5 mr-2" />,
    action: () => window.open("/community", "_self"),
  },
  {
    label: "Novo Acesso",
    icon: <Link className="h-5 w-5 mr-2" />,
    action: "openAccess" as const,
  },
  {
    label: "Adicionar Documento",
    icon: <FilePlus className="h-5 w-5 mr-2" />,
    action: "openDocument" as const,
  },
];

export const AdminFloatingActionButton = () => {
  const [open, setOpen] = useState(false);
  const { userProfile } = useAuth();
  const [accessDialogOpen, setAccessDialogOpen] = useState(false);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);

  if (!userProfile?.is_admin && !userProfile?.super_admin) return null;

  const handleOption = (option: (typeof FAB_OPTIONS)[number]) => {
    setOpen(false);
    if (option.action === "openAccess") setAccessDialogOpen(true);
    else if (option.action === "openDocument") setDocumentDialogOpen(true);
    else option.action();
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            className="fixed z-50 bottom-6 right-6 bg-black hover:bg-black/90 text-white rounded-full size-14 flex items-center justify-center shadow-xl"
            size="icon"
            aria-label="Ações rápidas admin"
          >
            <Plus className="w-8 h-8" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          side="top"
          className="w-64 p-2 space-y-1"
          sideOffset={16}
        >
          {FAB_OPTIONS.map((option) => (
            <Button
              key={option.label}
              variant="ghost"
              className="w-full !justify-start text-sm font-medium py-2 px-2"
              style={{ fontSize: "0.91rem" }} // Fonte ainda menor
              onClick={() => handleOption(option)}
            >
              {option.icon}
              {option.label}
            </Button>
          ))}
        </PopoverContent>
      </Popover>
      <NewAccessDialog open={accessDialogOpen} onOpenChange={setAccessDialogOpen} />
      <AddDocumentDialog open={documentDialogOpen} onOpenChange={setDocumentDialogOpen} />
    </>
  );
};

