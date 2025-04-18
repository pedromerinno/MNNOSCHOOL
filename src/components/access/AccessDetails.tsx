
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { AccessItem } from './types';

interface AccessDetailsProps {
  access: AccessItem | null;
  isOpen: boolean;
  onClose: () => void;
  companyColor?: string;
}

export const AccessDetails = ({ access, isOpen, onClose, companyColor }: AccessDetailsProps) => {
  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success(message))
      .catch(() => toast.error('Falha ao copiar para a área de transferência'));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{access?.tool_name}</DialogTitle>
        </DialogHeader>
        {access && (
          <div className="space-y-4 py-2">
            {access.url && (
              <div>
                <p className="text-sm font-medium mb-1 text-gray-500 dark:text-gray-400">URL</p>
                <div className="flex items-center justify-between gap-2">
                  <a 
                    href={access.url.startsWith('http') ? access.url : `https://${access.url}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    {access.url}
                    <ExternalLink size={16} className="ml-1" />
                  </a>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => copyToClipboard(access.url || '', 'URL copiada!')}
                  >
                    <Copy size={16} />
                  </Button>
                </div>
              </div>
            )}

            <div>
              <p className="text-sm font-medium mb-1 text-gray-500 dark:text-gray-400">Usuário</p>
              <div className="flex items-center justify-between gap-2">
                <p className="text-base font-medium">{access.username}</p>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => copyToClipboard(access.username, 'Usuário copiado!')}
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
                  onClick={() => copyToClipboard(access.password, 'Senha copiada!')}
                >
                  <Copy size={16} />
                </Button>
              </div>
            </div>

            {access.notes && (
              <div>
                <p className="text-sm font-medium mb-1 text-gray-500 dark:text-gray-400">Observações</p>
                <p className="text-sm">{access.notes}</p>
              </div>
            )}
          </div>
        )}
        <div className="flex justify-end">
          <Button 
            onClick={onClose}
            style={{
              backgroundColor: companyColor || undefined
            }}
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
