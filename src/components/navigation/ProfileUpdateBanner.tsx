
import { Camera, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export const ProfileUpdateBanner = () => {
  const { userProfile } = useAuth();
  const [isDismissed, setIsDismissed] = useState(false);

  // Não mostrar se o usuário tem avatar ou se foi dispensado
  if (userProfile?.avatar || isDismissed) {
    return null;
  }

  // Só mostrar se o usuário está logado e tem perfil
  if (!userProfile) {
    return null;
  }

  const handleUpdateProfile = () => {
    // Disparar evento personalizado para abrir o diálogo de perfil
    window.dispatchEvent(new CustomEvent('open-profile-dialog'));
  };

  return (
    <div className="w-full bg-blue-50 dark:bg-blue-950/20 border-b border-blue-100 dark:border-blue-900/30">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Camera className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-blue-800 dark:text-blue-200">
              Complete seu perfil adicionando uma foto para uma melhor experiência
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUpdateProfile}
              className="h-7 px-3 text-xs bg-blue-100 hover:bg-blue-200 border-blue-200 text-blue-800 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 dark:border-blue-800 dark:text-blue-200"
            >
              Atualizar perfil
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDismissed(true)}
              className="h-7 w-7 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-200 dark:hover:bg-blue-900/40"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
