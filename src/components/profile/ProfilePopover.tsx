
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
  const { user, userProfile, updateUserProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("https://i.pravatar.cc/150?img=68");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const { toast } = useToast();

  const form = useForm<UserProfileFormValues>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      name: "",
      avatar: "https://i.pravatar.cc/150?img=68",
    },
  });

  // Update form values when userProfile changes
  useEffect(() => {
    if (userProfile) {
      const profileData = {
        name: userProfile.display_name || email?.split('@')[0] || "",
        avatar: userProfile.avatar || "https://i.pravatar.cc/150?img=68"
      };
      
      form.reset(profileData);
      setAvatarPreview(profileData.avatar);
      
      console.log('[ProfilePopover] Form reset with profile data:', profileData);
    }
  }, [userProfile, email, form]);

  const uploadAvatarToStorage = async (file: File): Promise<string | null> => {
    if (!user) return null;
    
    try {
      setIsUploadingAvatar(true);
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      console.log('[ProfilePopover] Uploading avatar to:', filePath);
      
      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error('[ProfilePopover] Storage upload error:', error);
        throw error;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      console.log('[ProfilePopover] Avatar uploaded successfully:', publicUrl);
      return publicUrl;
      
    } catch (error: any) {
      console.error('[ProfilePopover] Error uploading avatar:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer upload da imagem",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleProfileUpdate = async (values: UserProfileFormValues) => {
    console.log('[ProfilePopover] Iniciando atualização de perfil com valores:', values);
    
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
      
      console.log('[ProfilePopover] Perfil atualizado com sucesso no banco!');
      
      // Chamar onSave para atualizar outros componentes
      onSave(values);
      
      // Dispatch custom event to notify other components about profile update
      window.dispatchEvent(new CustomEvent('profile-updated', {
        detail: {
          display_name: values.name,
          avatar: values.avatar
        }
      }));
      
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
      
      // Em caso de erro, reverter o preview para o valor original
      const originalAvatar = userProfile?.avatar || "https://i.pravatar.cc/150?img=68";
      setAvatarPreview(originalAvatar);
      form.setValue("avatar", originalAvatar);
      
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
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

    // Create preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setAvatarPreview(result);
    };
    reader.readAsDataURL(file);
    
    // Upload to storage
    const uploadedUrl = await uploadAvatarToStorage(file);
    if (uploadedUrl) {
      console.log('[ProfilePopover] Setting avatar URL:', uploadedUrl);
      form.setValue("avatar", uploadedUrl);
      setAvatarPreview(uploadedUrl);
    }
  };

  // Reset form quando abrir o dialog
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    
    if (newOpen && userProfile) {
      // Resetar form com dados atuais do perfil
      const currentData = {
        name: userProfile.display_name || email?.split('@')[0] || "",
        avatar: userProfile.avatar || "https://i.pravatar.cc/150?img=68"
      };
      
      form.reset(currentData);
      setAvatarPreview(currentData.avatar);
      console.log('[ProfilePopover] Dialog aberto, resetando form com dados atuais:', currentData);
    }
  };

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
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarPreview} alt="Avatar preview" />
                <AvatarFallback>{form.getValues().name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              
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
