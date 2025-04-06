
import { MainNavigationMenu } from "@/components/navigation/MainNavigationMenu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

const Documents = () => {
  const documents = [
    { name: "Contrato de Trabalho", type: "PDF", date: "12/03/2023" },
    { name: "Acordo de Confidencialidade", type: "PDF", date: "12/03/2023" },
    { name: "Políticas da Empresa", type: "PDF", date: "12/03/2023" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <MainNavigationMenu />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">Documentos</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Contratos</h2>
            <div className="space-y-4">
              {documents.map((doc, index) => (
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
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Documentos Pessoais</h2>
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
      </main>
    </div>
  );
};

export default Documents;
