
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CompanyManagementSection } from "./CompanyManagementSection";
import { useCompanies } from "@/hooks/useCompanies";
import { uploadAvatarImage } from "@/utils/imageUpload";

const userProfileSchema = z.object({
  name: z.string().min(2, {
    message: "Nome precisa ter pelo menos 2 caracteres.",
  }),
  avatar: z.string().optional(),
  aniversario: z.string().optional(),
  cidade: z.string().optional(),
});

export type UserProfileFormValues = z.infer<typeof userProfileSchema>;

interface ProfileDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  email?: string | null;
  onSave: (values: UserProfileFormValues) => void;
}

export const ProfileDialog = ({ isOpen, setIsOpen, email, onSave }: ProfileDialogProps) => {
  const { userProfile, updateUserProfile, user } = useAuth();
  const { userCompanies } = useCompanies();
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const form = useForm<UserProfileFormValues>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      name: "",
      avatar: "",
      aniversario: "",
      cidade: "",
    },
  });

  useEffect(() => {
    console.log('[ProfileDialog] userProfile atualizado:', userProfile);
    
    if (userProfile) {
      const displayName = userProfile.display_name || email?.split('@')[0] || "";
      const avatarUrl = userProfile.avatar || "";
      
      console.log('[ProfileDialog] Definindo valores:', { displayName, avatarUrl });
      
      form.reset({
        name: displayName,
        avatar: avatarUrl,
        aniversario: userProfile.aniversario || "",
        cidade: userProfile.cidade || "",
      });
      
      setAvatarPreview(avatarUrl);
    }
  }, [userProfile, email, form]);

  const handleProfileUpdate = async (values: UserProfileFormValues) => {
    try {
      console.log('[ProfileDialog] Atualizando perfil com valores:', values);
      
      await updateUserProfile({
        display_name: values.name,
        avatar: values.avatar || null,
        aniversario: values.aniversario || null,
        cidade: values.cidade || null,
      });
      
      onSave(values);
      
      toast({
        title: "Perfil atualizado",
        description: "Suas alterações foram salvas com sucesso.",
      });
      
      setIsOpen(false);
    } catch (error: any) {
      console.error('[ProfileDialog] Erro ao atualizar perfil:', error);
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
    
    console.log('[ProfileDialog] Arquivo selecionado:', file.name, file.type, file.size);
    
    setIsUploading(true);
    
    try {
      // Criar preview imediato
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        console.log('[ProfileDialog] Preview criado');
        setAvatarPreview(result);
      };
      reader.readAsDataURL(file);
      
      // Upload para o Supabase
      const publicUrl = await uploadAvatarImage(file, user.id);
      console.log('[ProfileDialog] Upload concluído, URL:', publicUrl);
      
      // Atualizar form e preview com a URL real
      form.setValue("avatar", publicUrl);
      setAvatarPreview(publicUrl);
      
      // Forçar atualização do contexto de autenticação
      await updateUserProfile({ avatar: publicUrl });
      
      toast({
        title: "Imagem carregada",
        description: "Sua foto de perfil foi carregada com sucesso!",
      });
      
    } catch (error: any) {
      console.error('[ProfileDialog] Erro no upload:', error);
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

  // Não renderizar se não estiver aberto
  if (!isOpen) {
    return null;
  }

  const currentAvatarUrl = avatarPreview || userProfile?.avatar || "/lovable-uploads/54cf67d5-105d-4bf2-8396-70dcf1507021.png";
  const currentName = form.watch("name") || userProfile?.display_name || email?.split('@')[0] || "U";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent 
        className="sm:max-w-[500px] overflow-y-auto max-h-[85vh]"
        style={{ pointerEvents: 'auto' }}
        onPointerDownOutside={(e) => {
          // Previne fechar o dialog quando clicar fora
          const target = e.target as Element;
          if (target.closest('[data-company-remove-button]')) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription>
            Atualize suas informações pessoais e de perfil aqui.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleProfileUpdate)} className="space-y-6">
            <div className="flex flex-col items-center gap-4 mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage 
                  src={currentAvatarUrl} 
                  alt="Avatar preview"
                  key={currentAvatarUrl}
                  onLoad={() => console.log('[ProfileDialog] Avatar carregado:', currentAvatarUrl)}
                  onError={() => console.error('[ProfileDialog] Erro ao carregar avatar:', currentAvatarUrl)}
                />
                <AvatarFallback>{currentName.charAt(0)?.toUpperCase()}</AvatarFallback>
              </Avatar>
              
              <div className="flex items-center gap-2">
                <label htmlFor="avatar-upload-dialog" className="cursor-pointer">
                  <div className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                    <Upload className="h-4 w-4" />
                    <span>{isUploading ? "Carregando..." : "Alterar foto"}</span>
                  </div>
                  <input
                    id="avatar-upload-dialog"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                    disabled={isUploading}
                  />
                </label>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="aniversario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Aniversário</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input placeholder="Cidade onde mora" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="border-t pt-4">
              <CompanyManagementSection 
                userCompanies={userCompanies} 
                allowUnlink={true}
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                disabled={isUploading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
