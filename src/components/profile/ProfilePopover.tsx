
import { useState, useEffect } from "react";
import { Upload, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { uploadAvatarImage } from "@/utils/imageUpload";
import { supabase } from "@/integrations/supabase/client";

const userProfileSchema = z.object({
  name: z.string().min(2, {
    message: "Nome precisa ter pelo menos 2 caracteres.",
  }),
  avatar: z.string().optional(),
});

export type UserProfileFormValues = z.infer<typeof userProfileSchema>;

interface ProfilePopoverProps {
  children: React.ReactNode;
  email?: string | null;
  onSave: (values: UserProfileFormValues) => void;
}

export const ProfilePopover = ({ children, email, onSave }: ProfilePopoverProps) => {
  const { userProfile, updateUserProfile, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const form = useForm<UserProfileFormValues>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      name: "",
      avatar: "",
    },
  });

  // Atualizar valores do form quando userProfile mudar
  useEffect(() => {
    console.log('[ProfilePopover] userProfile atualizado:', userProfile);
    
    if (userProfile) {
      const displayName = userProfile.display_name || email?.split('@')[0] || "";
      const avatarUrl = userProfile.avatar || "";
      
      console.log('[ProfilePopover] Definindo valores:', { displayName, avatarUrl });
      
      form.reset({
        name: displayName,
        avatar: avatarUrl
      });
      
      setAvatarPreview(avatarUrl);
    }
  }, [userProfile, email, form]);

  const handleProfileUpdate = async (values: UserProfileFormValues) => {
    try {
      console.log('[ProfilePopover] Atualizando perfil com valores:', values);
      
      await updateUserProfile({
        display_name: values.name,
        avatar: values.avatar || null
      });
      
      onSave(values);
      
      toast({
        title: "Perfil atualizado",
        description: "Suas alterações foram salvas com sucesso.",
      });
      
      setOpen(false);
    } catch (error: any) {
      console.error('[ProfilePopover] Erro ao atualizar perfil:', error);
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message || "Não foi possível salvar as alterações",
        variant: "destructive",
      });
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    
    console.log('[ProfilePopover] Arquivo selecionado:', file.name, file.type, file.size);
    
    setIsUploading(true);
    
    try {
      // Criar preview imediato
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        console.log('[ProfilePopover] Preview criado');
        setAvatarPreview(result);
      };
      reader.readAsDataURL(file);
      
      // Upload para o Supabase
      const publicUrl = await uploadAvatarImage(file, user.id);
      console.log('[ProfilePopover] Upload concluído, URL:', publicUrl);
      
      // Atualizar form e preview com a URL real
      form.setValue("avatar", publicUrl);
      setAvatarPreview(publicUrl);
      
      toast({
        title: "Imagem carregada",
        description: "Sua foto de perfil foi carregada com sucesso!",
      });
      
    } catch (error: any) {
      console.error('[ProfilePopover] Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: error.message || "Não foi possível carregar a imagem",
        variant: "destructive",
      });
      
      // Reverter para a imagem anterior em caso de erro
      const previousAvatar = userProfile?.avatar || "";
      setAvatarPreview(previousAvatar);
      form.setValue("avatar", previousAvatar);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!user) return;
    
    try {
      setIsUploading(true);
      
      console.log('[ProfilePopover] Removendo avatar do usuário:', user.id);
      
      // Atualizar diretamente no banco de dados
      const { error } = await supabase
        .from('profiles')
        .update({ avatar: null })
        .eq('id', user.id);

      if (error) {
        console.error('[ProfilePopover] Erro ao atualizar banco:', error);
        throw error;
      }
      
      // Atualizar contexto
      await updateUserProfile({ avatar: null });
      
      // Limpar preview e form
      setAvatarPreview("");
      form.setValue("avatar", "");
      
      toast({
        title: "Imagem removida",
        description: "Sua foto de perfil foi removida com sucesso!",
      });
      
    } catch (error: any) {
      console.error('[ProfilePopover] Erro ao remover avatar:', error);
      toast({
        title: "Erro ao remover imagem",
        description: error.message || "Não foi possível remover a imagem",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const currentAvatarUrl = avatarPreview || userProfile?.avatar || "/lovable-uploads/54cf67d5-105d-4bf2-8396-70dcf1507021.png";
  const currentName = form.watch("name") || userProfile?.display_name || email?.split('@')[0] || "U";
  
  // Melhorar a detecção de avatar personalizado
  const defaultAvatarUrl = "/lovable-uploads/54cf67d5-105d-4bf2-8396-70dcf1507021.png";
  const userAvatarUrl = avatarPreview || userProfile?.avatar;
  
  // Avatar é personalizado se existe e não é a imagem padrão
  const hasCustomAvatar = Boolean(
    userAvatarUrl && 
    userAvatarUrl.trim() !== "" && 
    userAvatarUrl !== defaultAvatarUrl
  );

  const handleOpenDialog = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[ProfilePopover] Tentando abrir dialog');
    setOpen(true);
  };

  console.log('[ProfilePopover] Estado atual:', { 
    open,
    currentAvatarUrl, 
    currentName, 
    isUploading, 
    hasCustomAvatar,
    userAvatar: userProfile?.avatar,
    preview: avatarPreview,
    userAvatarUrl,
    defaultAvatarUrl
  });

  return (
    <>
      <div onClick={handleOpenDialog} className="cursor-pointer">
        {children}
      </div>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
            <DialogDescription>
              Atualize suas informações de perfil aqui.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(handleProfileUpdate)} className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage 
                    src={currentAvatarUrl} 
                    alt="Avatar preview"
                    onLoad={() => console.log('[ProfilePopover] Avatar carregado:', currentAvatarUrl)}
                    onError={() => console.error('[ProfilePopover] Erro ao carregar avatar:', currentAvatarUrl)}
                  />
                  <AvatarFallback>{currentName.charAt(0)?.toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
              
              <div className="flex flex-col items-center gap-3 w-full">
                {/* Botão de upload */}
                <label htmlFor="avatar-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                    <Upload className="h-4 w-4" />
                    <span>{isUploading ? "Carregando..." : "Alterar foto"}</span>
                  </div>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                    disabled={isUploading}
                  />
                </label>
                
                {/* Botão de exclusão - mostrar sempre que há avatar personalizado */}
                {hasCustomAvatar && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteAvatar}
                    disabled={isUploading}
                    className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 hover:border-red-400 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remover foto
                  </Button>
                )}
                
                {/* Debug info - remover em produção */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="text-xs text-gray-400 mt-2">
                    <div>hasCustomAvatar: {hasCustomAvatar.toString()}</div>
                    <div>userAvatarUrl: {userAvatarUrl || 'null'}</div>
                    <div>isDefault: {(userAvatarUrl === defaultAvatarUrl).toString()}</div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium">Nome</label>
              <Input
                id="name"
                placeholder="Seu nome"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-sm font-medium text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            
            <DialogFooter className="flex justify-center sm:justify-center gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={isUploading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
