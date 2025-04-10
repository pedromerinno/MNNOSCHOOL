
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Key, Copy } from "lucide-react";
import { useCompanies } from "@/hooks/useCompanies";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

// Definição dos tipos
type AccessItem = {
  id: string;
  company_id: string;
  tool_name: string;
  username: string;
  password: string;
  url: string | null;
  notes: string | null;
  created_at: string;
};

const Access = () => {
  const { selectedCompany } = useCompanies();
  const [accessItems, setAccessItems] = useState<AccessItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAccess, setSelectedAccess] = useState<AccessItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchAccessItems = async () => {
      if (!selectedCompany) {
        setAccessItems([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('company_access')
          .select('*')
          .eq('company_id', selectedCompany.id)
          .order('tool_name');
        
        if (error) throw error;
        
        setAccessItems(data as AccessItem[] || []);
      } catch (error: any) {
        console.error('Erro ao carregar informações de acesso:', error);
        toast.error('Não foi possível carregar os dados de acesso');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccessItems();
  }, [selectedCompany]);

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success(message))
      .catch(() => toast.error('Falha ao copiar para a área de transferência'));
  };

  const openAccessDetails = (access: AccessItem) => {
    setSelectedAccess(access);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Carregando acessos...</p>
      </div>
    );
  }

  if (!selectedCompany) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-xl mx-auto">
            <CardContent className="flex flex-col items-center justify-center p-8">
              <Key className="h-16 w-16 text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Selecione uma empresa</h2>
              <p className="text-center text-gray-600 dark:text-gray-400">
                Selecione uma empresa no menu superior para visualizar os acessos cadastrados.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (accessItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6 dark:text-white">Acessos</h1>
          <Card className="max-w-xl mx-auto">
            <CardContent className="flex flex-col items-center justify-center p-8">
              <Key className="h-16 w-16 text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Nenhum acesso cadastrado</h2>
              <p className="text-center text-gray-600 dark:text-gray-400">
                Não há informações de acesso cadastradas para {selectedCompany.nome}.
              </p>
              <p className="text-center text-gray-600 dark:text-gray-400 mt-2">
                Peça ao administrador para adicionar os acessos necessários.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">Acessos</h1>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Aqui estão todos os acessos às ferramentas e plataformas utilizadas pela empresa {selectedCompany.nome}.
          Clique em um card para visualizar as informações completas.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accessItems.map((item) => (
            <Card 
              key={item.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => openAccessDetails(item)}
              style={{
                borderColor: selectedCompany.cor_principal || undefined,
                borderWidth: '1px'
              }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center">
                  <span className="dark:text-white">{item.tool_name}</span>
                  {item.url && (
                    <a 
                      href={item.url.startsWith('http') ? item.url : `https://${item.url}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink size={18} />
                    </a>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-2">
                  <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full mr-3">
                    <Key size={20} className="text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Usuário</p>
                    <p className="font-medium dark:text-white">{item.username}</p>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Clique para ver detalhes completos e copiar as credenciais
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedAccess?.tool_name}</DialogTitle>
            </DialogHeader>
            {selectedAccess && (
              <div className="space-y-4 py-2">
                {selectedAccess.url && (
                  <div>
                    <p className="text-sm font-medium mb-1 text-gray-500 dark:text-gray-400">URL</p>
                    <div className="flex items-center justify-between gap-2">
                      <a 
                        href={selectedAccess.url.startsWith('http') ? selectedAccess.url : `https://${selectedAccess.url}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center"
                      >
                        {selectedAccess.url}
                        <ExternalLink size={16} className="ml-1" />
                      </a>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => copyToClipboard(selectedAccess.url || '', 'URL copiada!')}
                      >
                        <Copy size={16} />
                      </Button>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium mb-1 text-gray-500 dark:text-gray-400">Usuário</p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-base font-medium">{selectedAccess.username}</p>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => copyToClipboard(selectedAccess.username, 'Usuário copiado!')}
                    >
                      <Copy size={16} />
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1 text-gray-500 dark:text-gray-400">Senha</p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-base font-medium">••••••••</p>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => copyToClipboard(selectedAccess.password, 'Senha copiada!')}
                    >
                      <Copy size={16} />
                    </Button>
                  </div>
                </div>

                {selectedAccess.notes && (
                  <div>
                    <p className="text-sm font-medium mb-1 text-gray-500 dark:text-gray-400">Observações</p>
                    <p className="text-sm">{selectedAccess.notes}</p>
                  </div>
                )}
              </div>
            )}
            <div className="flex justify-end">
              <Button 
                onClick={() => setIsDialogOpen(false)}
                style={{
                  backgroundColor: selectedCompany.cor_principal || undefined
                }}
              >
                Fechar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Access;
