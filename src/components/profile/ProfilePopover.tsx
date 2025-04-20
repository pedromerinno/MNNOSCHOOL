
import { useState } from "react";
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
  const { userProfile, updateUserProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(userProfile.avatar || "https://i.pravatar.cc/150?img=68");
  const { toast } = useToast();

  const form = useForm<UserProfileFormValues>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      name: userProfile.display_name || email?.split('@')[0] || "",
      avatar: userProfile.avatar || "https://i.pravatar.cc/150?img=68",
    },
  });

  const handleProfileUpdate = async (values: UserProfileFormValues) => {
    try {
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
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message || "Não foi possível salvar as alterações",
        variant: "destructive",
      });
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarPreview(result);
        form.setValue("avatar", result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <div onClick={() => setOpen(true)}>
        {children}
      </div>
      
      <Dialog open={open} onOpenChange={setOpen}>
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
                    <span>Alterar foto</span>
                  </div>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
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
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
