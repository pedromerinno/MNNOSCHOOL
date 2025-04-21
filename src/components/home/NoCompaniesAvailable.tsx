
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const NoCompaniesAvailable = () => {
  const { user } = useAuth();

  const handleRequestAccess = () => {
    const subject = encodeURIComponent("Solicitação de Acesso à Plataforma");
    const body = encodeURIComponent(
      `Olá,\n\nGostaria de solicitar acesso à plataforma Merinno.\n\nInformações do usuário:\nEmail: ${user?.email || "Não disponível"}\n\nAtenciosamente,\n${user?.email?.split('@')[0] || "Usuário"}`
    );
    
    window.location.href = `mailto:suporte@merinno.com?subject=${subject}&body=${body}`;
    
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
        
        <Button 
          variant="outline" 
          className="border-black hover:bg-black/5"
          onClick={handleRequestAccess}
        >
          Solicitar acesso
        </Button>
      </div>
    </div>
  );
};
