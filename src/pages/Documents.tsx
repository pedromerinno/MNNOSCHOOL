
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload, Download, File, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserDocumentsViewer } from "@/hooks/useUserDocumentsViewer";
import { format } from "date-fns";
import { UserDocument, DOCUMENT_TYPE_LABELS } from "@/types/document";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanies } from '@/hooks/useCompanies';

const Documents = () => {
  const { selectedCompany } = useCompanies();
  const [activeTab, setActiveTab] = useState("personal");
  const { documents, isLoading, downloadDocument } = useUserDocumentsViewer();
  
  // Group documents by type
  const documentsByType = documents.reduce((acc, doc) => {
    if (!acc[doc.document_type]) {
      acc[doc.document_type] = [];
    }
    acc[doc.document_type].push(doc);
    return acc;
  }, {} as Record<string, UserDocument[]>);

  // Placeholder documents for the Personal tab
  const personalDocuments = [
    { name: "Contrato de Trabalho", type: "PDF", date: "12/03/2023" },
    { name: "Políticas da Empresa", type: "PDF", date: "12/03/2023" },
  ];

  const handleDownload = async (document: UserDocument) => {
    await downloadDocument(document);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">Documentos</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="company" className="flex items-center">
              <FolderOpen className="h-4 w-4 mr-2" />
              Documentos da Empresa
            </TabsTrigger>
            <TabsTrigger value="personal" className="flex items-center">
              <File className="h-4 w-4 mr-2" />
              Documentos Pessoais
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
                <div className="space-y-4">
                  {personalDocuments.map((doc, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-500 mr-3" />
                          <div>
                            <p className="font-medium dark:text-white">{doc.name}</p>
                            <p className="text-sm text-gray-500">{doc.type} • {doc.date}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Ver</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4 dark:text-white">Enviar Documentos</h2>
                <Card>
                  <CardContent className="p-6">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400 mb-2">Arraste e solte seus documentos aqui</p>
                      <p className="text-gray-500 text-sm mb-4">ou</p>
                      <Button>Escolher Arquivos</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Documents;
