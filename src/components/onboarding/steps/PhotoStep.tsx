
import React, { useState, useEffect } from "react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Button } from "@/components/ui/button";
import { Camera, Upload, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface PhotoStepProps {
  onNext: () => void;
  onBack: () => void;
}

const PhotoStep: React.FC<PhotoStepProps> = ({ onNext, onBack }) => {
  const { user, userProfile, updateUserProfile } = useAuth();
  const { profileData, updateProfileData } = useOnboarding();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(userProfile?.avatar || profileData.avatarUrl);

  // Set avatar from userProfile if available
  useEffect(() => {
    if (userProfile?.avatar) {
      setAvatarUrl(userProfile.avatar);
      updateProfileData({ avatarUrl: userProfile.avatar });
    }
  }, [userProfile, updateProfileData]);

  const uploadAvatar = async (file: File) => {
    if (!user) return;
    
    setIsUploading(true);
    setError("");
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${user.id}-${Math.random().toString(36).substring(2)}`;
      const filePath = `${fileName}.${fileExt}`;
      
      // Upload para o storage do Supabase no bucket 'avatars'
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      // Atualizar URL no estado local e no contexto
      setAvatarUrl(publicUrl);
      updateProfileData({ avatarUrl: publicUrl });
      
      // Atualizar o perfil no banco de dados
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar: publicUrl })
        .eq('id', user.id);
      
      if (updateError) throw updateError;
      
      // Também atualizar no contexto de autenticação
      await updateUserProfile({ avatar: publicUrl });
      
      toast.success("Foto de perfil carregada com sucesso!");
      
    } catch (error: any) {
      console.error("Erro ao fazer upload:", error);
      const errorMessage = error.message || "Erro ao fazer upload da imagem";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    
    // Validação de tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      setError("A imagem deve ter no máximo 5MB");
      return;
    }
    
    // Validação de tipo
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      toast.error("O arquivo deve ser uma imagem (JPEG ou PNG)");
      setError("O arquivo deve ser uma imagem (JPEG ou PNG)");
      return;
    }
    
    uploadAvatar(file);
  };

  const handleSkip = () => {
    updateProfileData({ avatarUrl: null });
    onNext();
  };

  const handleContinue = () => {
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-medium">Adicione uma foto</h2>
        <p className="text-gray-500 text-sm">
          Esta será sua foto de perfil na plataforma. Você pode pular esta etapa se preferir.
        </p>
      </div>
      
      <div className="flex flex-col items-center justify-center space-y-4">
        <Avatar className="h-32 w-32 border-2 border-gray-200">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt="Foto de perfil" />
          ) : (
            <AvatarFallback className="bg-gray-100 text-xl">
              {profileData.displayName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
        
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
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
        </div>
        
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
      
      <div className="pt-4 flex flex-col gap-3">
        <Button 
          type="button" 
          className="w-full rounded-md bg-merinno-dark hover:bg-black text-white"
          onClick={handleContinue}
        >
          Continuar
        </Button>
        
        <Button 
          type="button" 
          variant="ghost"
          className="w-full rounded-md text-gray-500"
          onClick={handleSkip}
        >
          Pular esta etapa
        </Button>
        
        <Button 
          type="button" 
          variant="ghost"
          className="flex items-center justify-center gap-2 text-gray-500 mt-2"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>
    </div>
  );
};

export default PhotoStep;
