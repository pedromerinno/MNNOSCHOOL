
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, CheckCircle, Upload, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileComplete: () => void;
}

export const UserProfileDialog: React.FC<UserProfileDialogProps> = ({
  open,
  onOpenChange,
  onProfileComplete,
}) => {
  const { user, userProfile, updateUserProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [displayName, setDisplayName] = useState(userProfile?.display_name || "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(userProfile?.avatar || null);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  useEffect(() => {
    if (userProfile?.display_name) {
      setDisplayName(userProfile.display_name);
    } else if (user?.email) {
      setDisplayName(user.email.split('@')[0]);
    }
    
    if (userProfile?.avatar) {
      setAvatarUrl(userProfile.avatar);
    }
  }, [user, userProfile]);

  const handleNameSubmit = () => {
    if (!displayName.trim()) {
      toast.error("Por favor, informe seu nome");
      return;
    }
    setCurrentStep(2);
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return;
    
    setIsUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${user.id}-${Math.random().toString(36).substring(2)}`;
      const filePath = `${fileName}.${fileExt}`;
      
      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      setAvatarUrl(publicUrl);
      
      toast.success("Foto de perfil carregada com sucesso!");
    } catch (error: any) {
      console.error("Erro ao fazer upload:", error);
      toast.error("Erro ao fazer upload da imagem");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    
    // Size validation (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }
    
    // Type validation
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      toast.error("O arquivo deve ser uma imagem (JPEG ou PNG)");
      return;
    }
    
    uploadAvatar(file);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          avatar: avatarUrl,
          primeiro_login: false
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Update profile in context
      await updateUserProfile({
        display_name: displayName,
        avatar: avatarUrl,
        primeiro_login: false
      });
      
      // Show success animation
      setShowSuccess(true);
      
      // Close dialog after animation
      setTimeout(() => {
        setShowSuccess(false);
        onProfileComplete();
      }, 2000);
      
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      toast.error("Ocorreu um erro ao salvar seu perfil");
    }
  };

  const handleSkipPhoto = () => {
    handleSaveProfile();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg p-0 overflow-hidden">
        {!showSuccess ? (
          <div className="bg-white dark:bg-gray-900 p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-center mb-1">
                {currentStep === 1 ? 'Como podemos te chamar?' : 'Adicione uma foto de perfil'}
              </DialogTitle>
              <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
                {currentStep === 1
                  ? 'Personalize sua experiência na plataforma'
                  : 'Escolha uma foto para seu perfil'}
              </p>
            </DialogHeader>

            <div className="mt-6">
              {currentStep === 1 ? (
                <>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Input
                        id="name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="border-gray-300 rounded-md px-4 py-3 text-base focus-visible:ring-primary"
                        placeholder="Digite seu nome"
                      />
                    </div>
                    
                    <Button 
                      onClick={handleNameSubmit}
                      className="w-full bg-black hover:bg-gray-800 text-white font-medium py-6 flex items-center justify-center gap-2"
                    >
                      Continuar
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col items-center justify-center space-y-6">
                    <Avatar className="h-32 w-32 border-2 border-gray-200 ring-4 ring-gray-50">
                      {avatarUrl ? (
                        <AvatarImage src={avatarUrl} alt="Foto de perfil" />
                      ) : (
                        <AvatarFallback className="bg-gray-100 text-xl">
                          {displayName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => document.getElementById('avatar-upload')?.click()}
                        disabled={isUploading}
                      >
                        {isUploading ? "Enviando..." : "Upload"}
                        <Upload className="h-4 w-4" />
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                          disabled={isUploading}
                        />
                      </Button>
                      
                      <Button 
                        variant="default" 
                        className="bg-black hover:bg-gray-800 text-white"
                        onClick={handleSaveProfile}
                      >
                        Salvar
                      </Button>
                    </div>
                    
                    <Button 
                      type="button" 
                      variant="ghost"
                      className="text-gray-500"
                      onClick={handleSkipPhoto}
                    >
                      Pular esta etapa
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-12 h-64">
            <div className="text-center">
              <Sparkles className="h-16 w-16 text-green-500 mx-auto animate-bounce mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
                Perfil atualizado!
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Suas informações foram salvas com sucesso.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
