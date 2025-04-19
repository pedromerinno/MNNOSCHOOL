
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AccessField } from "./components/AccessField";
import { AccessDetailsProps } from "./types/access-details";

export const AccessDetails = ({ 
  access, 
  isOpen, 
  onClose, 
  companyColor 
}: AccessDetailsProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{access?.tool_name}</DialogTitle>
        </DialogHeader>
        {access && (
          <div className="space-y-4 py-2">
            {access.url && (
              <AccessField
                label="URL"
                value={access.url}
                copyMessage="URL copiada!"
                hasExternalLink
              />
            )}
            
            <AccessField
              label="Usuário"
              value={access.username}
              copyMessage="Usuário copiado!"
            />
            
            <AccessField
              label="Senha"
              value={access.password}
              copyMessage="Senha copiada!"
              isPassword
            />

            {access.notes && (
              <AccessField
                label="Observações"
                value={access.notes}
                canCopy={false}
              />
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
