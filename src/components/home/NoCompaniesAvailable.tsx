
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useCompanies } from "@/hooks/useCompanies";

export const NoCompaniesAvailable = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useAuth();
  const { forceGetUserCompanies } = useCompanies();

  const handleRequestAccess = () => {
    // Add email subject and body with user information
    const subject = encodeURIComponent("Solicitação de Acesso à Plataforma");
    const body = encodeURIComponent(
      `Olá,\n\nGostaria de solicitar acesso à plataforma Merinno.\n\nInformações do usuário:\nEmail: ${user?.email || "Não disponível"}\nID do usuário: ${user?.id || "Não disponível"}\n\nAtenciosamente,\n${user?.email?.split('@')[0] || "Usuário"}`
    );
    
    // Open mail client with pre-filled email
    window.location.href = `mailto:suporte@merinno.com?subject=${subject}&body=${body}`;
    
    // Show confirmation toast
    toast.success("Redirecionando para seu cliente de email", {
      description: "Preencha os detalhes adicionais necessários e envie o email para solicitar acesso.",
    });
  };

  const handleRefreshData = async () => {
    if (!user?.id) return;
    
    setIsRefreshing(true);
    toast.info("Verificando acesso a empresas...");
    
    try {
      await forceGetUserCompanies(user.id);
      // O componente será atualizado automaticamente se empresas forem encontradas
      toast.success("Dados atualizados");
    } catch (error) {
      console.error("Erro ao atualizar dados:", error);
      toast.error("Não foi possível atualizar os dados");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="text-center max-w-md mx-auto">
        <div className="flex justify-center mb-6">
          <AlertTriangle className="h-16 w-16 text-amber-500" />
        </div>
        
        <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
          Nenhuma empresa disponível
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Não foi encontrada nenhuma empresa vinculada à sua conta. Isso pode ocorrer se você ainda não foi convidado para nenhuma empresa ou se seu cadastro está em processamento.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-4">
          <Button 
            variant="default" 
            className="bg-black hover:bg-black/80 text-white"
            onClick={handleRequestAccess}
          >
            Solicitar acesso
          </Button>
          
          <Button 
            variant="outline" 
            className="border-black hover:bg-black/5 flex items-center gap-2"
            onClick={handleRefreshData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar dados
          </Button>
        </div>
        
        <div className="mt-4">
          <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
            <SheetTrigger asChild>
              <Button variant="link" className="text-gray-500">
                Precisa de ajuda?
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Suporte Merinno</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <p>
                  Se você está tentando acessar a plataforma mas não tem nenhuma empresa 
                  vinculada, você precisa entrar em contato com o suporte da Merinno.
                </p>
                <p>
                  Existem duas possibilidades:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Você ainda não foi convidado para nenhuma empresa</li>
                  <li>Seu cadastro na plataforma ainda está sendo processado</li>
                </ul>
                <p className="pt-2">
                  Em ambos os casos, clique no botão "Solicitar acesso" para enviar um email 
                  para nossa equipe de suporte.
                </p>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {user && (
          <div className="mt-8 p-4 border border-gray-200 rounded-lg text-left text-sm">
            <h3 className="font-semibold mb-2">Informações para suporte:</h3>
            <p><span className="font-medium">Email:</span> {user.email}</p>
            <p><span className="font-medium">ID do usuário:</span> {user.id}</p>
            <p className="mt-2 text-xs text-gray-500">
              Inclua estas informações ao solicitar suporte para agilizar seu atendimento.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
