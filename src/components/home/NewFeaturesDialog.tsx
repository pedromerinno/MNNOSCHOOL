import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface NewFeaturesDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const NewFeaturesDialog = ({ open: controlledOpen, onOpenChange }: NewFeaturesDialogProps = {}) => {
  const { user, updateUserProfile } = useAuth();
  
  // Usa o estado controlado externamente
  const open = controlledOpen ?? false;
  const setOpen = onOpenChange || (() => {});

  const handleClose = async () => {
    setOpen(false);
    
    // Atualizar primeiro_login para false no banco de dados
    if (user?.id) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ primeiro_login: false })
          .eq('id', user.id);
        
        if (error) {
          console.error('Erro ao atualizar primeiro_login:', error);
        } else {
          // Atualizar o perfil no contexto
          await updateUserProfile({ primeiro_login: false });
        }
      } catch (error) {
        console.error('Erro ao atualizar primeiro_login:', error);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl p-0 [&>button]:hidden border-0 sm:rounded-[1.5rem] overflow-visible">
        <div className="flex rounded-[1.5rem] overflow-hidden shadow-md border-8 border-white min-h-[500px]">
          {/* Seção esquerda com gradiente azul */}
          <div className="w-[40%] bg-gradient-to-b from-blue-300 via-blue-200 to-blue-50 rounded-l-xl" />
          
          {/* Seção direita branca com conteúdo */}
          <div className="flex-1 bg-white p-8 flex flex-col rounded-r-xl">
            <DialogHeader className="text-left mb-6">
              <DialogTitle className="text-3xl font-bold text-black mb-2">
                New Features
              </DialogTitle>
              <p className="text-gray-600 text-sm">
                Novas funcionalidades e melhorias para você
              </p>
            </DialogHeader>
            
            <div className="flex-1 space-y-3 overflow-y-auto">
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-sm text-black mb-1.5">Integração</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Processo de onboard de novo colaborador na plataforma.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-sm text-black mb-1.5">Senhas</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Gerenciamento de senhas aprimorado com maior segurança.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-sm text-black mb-1.5">Documentos</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Organize e acesse seus documentos de forma mais intuitiva.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="font-semibold text-sm text-black">Escola</h3>
                    <Badge variant="beta" className="text-xs">Beta</Badge>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Novas ferramentas para alunos e professores.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button onClick={handleClose} className="px-6">
                Entendi
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

