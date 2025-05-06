import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DocumentType, DOCUMENT_TYPE_LABELS } from "@/types/document";
import { useState } from "react";
import { toast } from "sonner";
import { MAX_FILE_SIZE } from "@/hooks/documents/constants";
interface DocumentUploadFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (file: File, documentType: DocumentType, description: string) => Promise<boolean>;
  isUploading: boolean;
}
export const DocumentUploadForm = ({
  open,
  onOpenChange,
  onUpload,
  isUploading
}: DocumentUploadFormProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>("confidentiality_agreement");
  const [description, setDescription] = useState("");
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > MAX_FILE_SIZE) {
        toast.error("O tamanho máximo do arquivo é 10MB");
        return;
      }
      setFile(selectedFile);
    }
  };
  const resetForm = () => {
    setFile(null);
    setDocumentType("confidentiality_agreement");
    setDescription("");
  };
  const handleSubmit = async () => {
    if (!file) return;
    const success = await onUpload(file, documentType, description);
    if (success) {
      resetForm();
      onOpenChange(false);
    }
  };
  return <>
      <Card>
        <CardContent className="p-6 px-[40px] py-[40px]">
          <div onDragOver={e => {
          e.preventDefault();
          e.stopPropagation();
          e.currentTarget.classList.add('border-primary');
        }} onDragLeave={e => {
          e.preventDefault();
          e.currentTarget.classList.remove('border-primary');
        }} onDrop={e => {
          e.preventDefault();
          e.currentTarget.classList.remove('border-primary');
          const files = Array.from(e.dataTransfer.files);
          if (files.length > 0) {
            setFile(files[0]);
            onOpenChange(true);
          }
        }} className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors py-[80px] px-[80px]">
            <Upload className="h-10 w-8 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Arraste e solte seus documentos aqui
            </p>
            <p className="text-gray-500 text-sm mb-4">ou</p>
            <Button onClick={() => onOpenChange(true)}>Escolher Arquivos</Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload de Documento</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="document-type">Tipo de Documento</Label>
              <Select value={documentType} onValueChange={value => setDocumentType(value as DocumentType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de documento" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="document-file">Arquivo</Label>
              <Input id="document-file" type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
              {file && <p className="text-sm text-gray-500">
                  Arquivo selecionado: {file.name} ({Math.round(file.size / 1024)} KB)
                </p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="document-description">Descrição (opcional)</Label>
              <Textarea id="document-description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Adicione informações sobre este documento" rows={3} />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
            resetForm();
            onOpenChange(false);
          }}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={!file || isUploading}>
              {isUploading ? <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </> : <>
                  <Upload className="mr-2 h-4 w-4" />
                  Enviar Documento
                </>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>;
};