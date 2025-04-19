import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload, Download, File, FolderOpen } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserDocumentsViewer } from "@/hooks/useUserDocumentsViewer";
import { format } from "date-fns";
import { UserDocument, DOCUMENT_TYPE_LABELS, DocumentType } from "@/types/document";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanies } from '@/hooks/useCompanies';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Documents = () => {
  const { selectedCompany } = useCompanies();
  const [activeTab, setActiveTab] = useState("company");
  const { documents, isLoading, downloadDocument, refreshDocuments } = useUserDocumentsViewer();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>("confidentiality_agreement");
  const [description, setDescription] = useState("");
  
  const documentsByType = documents.reduce((acc, doc) => {
    if (!acc[doc.document_type]) {
      acc[doc.document_type] = [];
    }
    acc[doc.document_type].push(doc);
    return acc;
  }, {} as Record<string, UserDocument[]>);

  const handleDownload = async (document: UserDocument) => {
    await downloadDocument(document);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error("O tamanho máximo do arquivo é 10MB");
        return;
      }
      setFile(selectedFile);
    }
  };

  const resetUploadForm = () => {
    setFile(null);
    setDocumentType("confidentiality_agreement");
    setDescription("");
  };

  const handleUpload = async () => {
    if (!file || !selectedCompany?.id) {
      toast.error("Por favor, selecione um arquivo e verifique se a empresa está selecionada");
      return;
    }

    setIsUploading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Usuário não autenticado");
        setIsUploading(false);
        return;
      }
      
      const userDir = `user-documents/${user.id}`;
      const fileExt = file.name.split('.').pop();
      const fileName = `${userDir}/${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { error } = await supabase
        .from('user_documents')
        .insert({
          user_id: user.id,
          company_id: selectedCompany.id,
          name: file.name,
          file_path: filePath,
          file_type: file.type,
          document_type: documentType,
          description: description || null,
          uploaded_by: user.id
        });

      if (error) throw error;

      toast.success('Documento enviado com sucesso');
      resetUploadForm();
      setUploadOpen(false);
      refreshDocuments();
    } catch (error: any) {
      console.error('Error uploading document:', error);
      
      if (error.message.includes("storage/object-not-found")) {
        toast.error("Arquivo não encontrado. Verifique se o arquivo existe.");
      } else if (error.message.includes("already exists")) {
        toast.error("Um arquivo com este nome já existe. Tente novamente.");
      } else {
        toast.error(`Erro no upload: ${error.message}`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <PageLayout title="Documentos">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="company" className="flex items-center">
              <FolderOpen className="h-4 w-4 mr-2" />
              Documentos da Empresa
            </TabsTrigger>
            <TabsTrigger value="personal" className="flex items-center">
              <File className="h-4 w-4 mr-2" />
              Meus Documentos
            </TabsTrigger>
          </TabsList>
          
          <Separator className="my-6" />
          
          <TabsContent value="company" className="mt-6">
            {!selectedCompany ? (
              <Card>
                <CardContent className="p-6 flex flex-col items-center justify-center">
                  <FolderOpen className="h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Selecione uma empresa</h3>
                  <p className="text-gray-500 text-center">
                    Selecione uma empresa no menu superior para visualizar seus documentos.
                  </p>
                </CardContent>
              </Card>
            ) : isLoading ? (
              <div className="grid gap-6 md:grid-cols-2">
                {[1, 2, 3, 4].map(i => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : Object.keys(documentsByType).length === 0 ? (
              <Card>
                <CardContent className="p-6 flex flex-col items-center justify-center">
                  <FileText className="h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Nenhum documento disponível</h3>
                  <p className="text-gray-500 text-center">
                    Você não possui documentos disponíveis para esta empresa.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {Object.entries(documentsByType).map(([type, docs]) => (
                  <Card key={type}>
                    <CardHeader>
                      <CardTitle>{DOCUMENT_TYPE_LABELS[type as any] || type}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {docs.map((doc) => (
                          <div 
                            key={doc.id}
                            className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <div className="flex items-center">
                              <FileText className="h-5 w-5 text-blue-500 mr-3" />
                              <div>
                                <p className="font-medium">{doc.name}</p>
                                <p className="text-sm text-gray-500">
                                  {format(new Date(doc.uploaded_at), 'dd/MM/yyyy')}
                                </p>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDownload(doc)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="personal" className="mt-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold mb-4 dark:text-white">Meus Documentos</h2>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : documents.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-lg font-medium mb-2">Nenhum documento pessoal</h3>
                      <p className="text-gray-500 mb-4">
                        Você ainda não possui documentos pessoais cadastrados.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {documents.map((doc) => (
                      <Card key={doc.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-gray-500 mr-3" />
                            <div>
                              <p className="font-medium dark:text-white">{doc.name}</p>
                              <p className="text-sm text-gray-500">
                                {DOCUMENT_TYPE_LABELS[doc.document_type] || doc.document_type} • {format(new Date(doc.uploaded_at), 'dd/MM/yyyy')}
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownload(doc)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Baixar
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4 dark:text-white">Enviar Documentos</h2>
                <Card>
                  <CardContent className="p-6">
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.currentTarget.classList.add('border-primary');
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('border-primary');
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('border-primary');
                        const files = Array.from(e.dataTransfer.files);
                        if (files.length > 0) {
                          setFile(files[0]);
                          setUploadOpen(true);
                        }
                      }}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors"
                    >
                      <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        Arraste e solte seus documentos aqui
                      </p>
                      <p className="text-gray-500 text-sm mb-4">ou</p>
                      <Button onClick={() => setUploadOpen(true)}>Escolher Arquivos</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload de Documento</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="document-type">Tipo de Documento</Label>
                <Select 
                  value={documentType} 
                  onValueChange={(value) => setDocumentType(value as DocumentType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de documento" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="document-file">Arquivo</Label>
                <Input 
                  id="document-file" 
                  type="file" 
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                {file && (
                  <p className="text-sm text-gray-500">
                    Arquivo selecionado: {file.name} ({Math.round(file.size / 1024)} KB)
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="document-description">Descrição (opcional)</Label>
                <Textarea 
                  id="document-description" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Adicione informações sobre este documento"
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                resetUploadForm();
                setUploadOpen(false);
              }}>
                Cancelar
              </Button>
              <Button 
                onClick={handleUpload} 
                disabled={!file || isUploading || !selectedCompany}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Enviar Documento
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </PageLayout>
  );
};

export default Documents;
