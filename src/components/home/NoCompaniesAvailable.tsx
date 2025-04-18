
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const NoCompaniesAvailable = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { user } = useAuth();

  const handleRequestAccess = () => {
    // Add email subject and body with user information
    const subject = encodeURIComponent("Solicitação de Acesso à Plataforma");
    const body = encodeURIComponent(
      `Olá,\n\nGostaria de solicitar acesso à plataforma Merinno.\n\nInformações do usuário:\nEmail: ${user?.email || "Não disponível"}\n\nAtenciosamente,\n${user?.email?.split('@')[0] || "Usuário"}`
    );
    
    // Open mail client with pre-filled email
    window.location.href = `mailto:suporte@merinno.com?subject=${subject}&body=${body}`;
    
    // Show confirmation toast
    toast.success("Redirecionando para seu cliente de email", {
      description: "Preencha os detalhes adicionais necessários e envie o email para solicitar acesso.",
    });
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
          Por enquanto não há nenhuma empresa disponível no momento, solicite seu acesso.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button 
            variant="default" 
            className="bg-black hover:bg-black/80 text-white"
            onClick={handleRequestAccess}
          >
            Solicitar acesso
          </Button>
          
          <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="border-black hover:bg-black/5">
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
      </div>
    </div>
  );
};
