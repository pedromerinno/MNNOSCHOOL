
import { useState, useEffect } from "react";
import { Upload } from "lucide-react";
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
import { uploadAvatar, deleteOldAvatar } from "@/utils/storage";

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
  const { user, userProfile, updateUserProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const { toast } = useToast();

  const form = useForm<UserProfileFormValues>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      name: "",
      avatar: "",
    },
  });

  // Debug: Log userProfile changes
  useEffect(() => {
    console.log('[ProfilePopover] userProfile changed:', {
      display_name: userProfile?.display_name,
      avatar: userProfile?.avatar,
      email: userProfile?.email
    });
  }, [userProfile]);

  // Update form values when userProfile changes
  useEffect(() => {
    if (userProfile) {
      const profileData = {
        name: userProfile.display_name || email?.split('@')[0] || "",
        avatar: userProfile.avatar || ""
      };
      
      console.log('[ProfilePopover] Updating form with profile data:', profileData);
      form.reset(profileData);
      setAvatarPreview(profileData.avatar || "");
    }
  }, [userProfile, email, form]);

  // Debug: Log avatarPreview changes
  useEffect(() => {
    console.log('[ProfilePopover] avatarPreview changed to:', avatarPreview);
  }, [avatarPreview]);

  const handleProfileUpdate = async (values: UserProfileFormValues) => {
    console.log('[ProfilePopover] === INÍCIO handleProfileUpdate ===');
    console.log('[ProfilePopover] Valores recebidos:', values);
    
    if (!user?.id) {
      console.error('[ProfilePopover] Usuário não encontrado');
      toast({
        title: "Erro",
        description: "Usuário não encontrado",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('[ProfilePopover] Chamando updateUserProfile com dados:', {
        display_name: values.name,
        avatar: values.avatar
      });
      
      await updateUserProfile({
        display_name: values.name,
        avatar: values.avatar
      });
      
      console.log('[ProfilePopover] ✅ Perfil atualizado com sucesso!');
      
      // Chamar onSave para atualizar outros componentes
      onSave(values);
      
      // Dispatch custom event to notify other components about profile update
      window.dispatchEvent(new CustomEvent('profile-updated', {
        detail: {
          display_name: values.name,
          avatar: values.avatar
        }
      }));
      
      console.log('[ProfilePopover] Evento profile-updated disparado');
      
      toast({
        title: "Perfil atualizado",
        description: "Suas alterações foram salvas com sucesso.",
      });
      
      setOpen(false);
      
    } catch (error: any) {
      console.error('[ProfilePopover] ❌ Erro ao atualizar perfil:', error);
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message || "Não foi possível salvar as alterações",
        variant: "destructive",
      });
      
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;
    
    console.log('[ProfilePopover] === INÍCIO handleAvatarChange ===');
    console.log('[ProfilePopover] Arquivo selecionado:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    // Validar tamanho do arquivo (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "Por favor, selecione uma imagem menor que 5MB",
        variant: "destructive",
      });
      return;
    }

    // Validar tipo do arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione apenas imagens",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploadingAvatar(true);
      
      // Create preview immediately
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        console.log('[ProfilePopover] Preview local criado:', result.substring(0, 50) + '...');
        setAvatarPreview(result);
      };
      reader.readAsDataURL(file);
      
      // Delete old avatar if exists
      if (userProfile?.avatar && !userProfile.avatar.includes('pravatar.cc')) {
        console.log('[ProfilePopover] Deletando avatar antigo:', userProfile.avatar);
        await deleteOldAvatar(userProfile.avatar);
      }
      
      // Upload to storage
      console.log('[ProfilePopover] Iniciando upload para storage...');
      const uploadedUrl = await uploadAvatar(file, user.id);
      
      if (uploadedUrl) {
        console.log('[ProfilePopover] ✅ Upload concluído, URL:', uploadedUrl);
        form.setValue("avatar", uploadedUrl);
        setAvatarPreview(uploadedUrl);
        
        toast({
          title: "Upload concluído",
          description: "Imagem carregada com sucesso! Clique em 'Salvar' para confirmar.",
        });
      } else {
        throw new Error('Falha no upload - URL não retornada');
      }
    } catch (error: any) {
      console.error('[ProfilePopover] ❌ Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: error.message || "Não foi possível fazer upload da imagem",
        variant: "destructive",
      });
      
      // Restore previous avatar preview on error
      setAvatarPreview(userProfile?.avatar || "");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Reset form quando abrir o dialog
  const handleOpenChange = (newOpen: boolean) => {
    console.log('[ProfilePopover] Dialog state changing to:', newOpen);
    setOpen(newOpen);
    
    if (newOpen && userProfile) {
      // Resetar form com dados atuais do perfil
      const currentData = {
        name: userProfile.display_name || email?.split('@')[0] || "",
        avatar: userProfile.avatar || ""
      };
      
      console.log('[ProfilePopover] Resetando form ao abrir dialog:', currentData);
      form.reset(currentData);
      setAvatarPreview(currentData.avatar || "");
    }
  };

  // Debug: Log form values
  const currentFormValues = form.watch();
  console.log('[ProfilePopover] Form values atuais:', currentFormValues);
  console.log('[ProfilePopover] Avatar preview atual:', avatarPreview);

  return (
    <>
      <div onClick={() => handleOpenChange(true)}>
        {children}
      </div>
      
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="w-full max-w-sm sm:max-w-md" style={{ pointerEvents: 'auto' }}>
          <DialogHeader>
            <DialogTitle className="text-center">Editar Perfil</DialogTitle>
            <DialogDescription className="text-center">
              Atualize suas informações de perfil aqui.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(handleProfileUpdate)} className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage 
                    src={avatarPreview} 
                    alt="Avatar preview"
                    onLoad={() => console.log('[ProfilePopover] Avatar image loaded successfully:', avatarPreview)}
                    onError={() => console.log('[ProfilePopover] Avatar image failed to load:', avatarPreview)}
                  />
                  <AvatarFallback>{form.getValues().name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                {avatarPreview && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white"></div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <label htmlFor="avatar-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 text-sm text-merinno-blue hover:underline">
                    <Upload className="h-4 w-4" />
                    <span>{isUploadingAvatar ? "Enviando..." : "Alterar foto"}</span>
                  </div>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                    disabled={isUploadingAvatar}
                  />
                </label>
              </div>
              
              {avatarPreview && (
                <div className="text-xs text-gray-500 text-center max-w-64 truncate">
                  {avatarPreview.substring(0, 40)}...
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium">Nome</label>
              <Input
                id="name"
                placeholder="Seu nome"
                {...form.register("name")}
                className="w-full text-center"
              />
              {form.formState.errors.name && (
                <p className="text-sm font-medium text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            
            <DialogFooter className="flex justify-center sm:justify-center gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting || isUploadingAvatar}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || isUploadingAvatar}
              >
                {isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
