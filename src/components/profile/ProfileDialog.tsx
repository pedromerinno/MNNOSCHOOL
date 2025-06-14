
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

const userProfileSchema = z.object({
  name: z.string().min(2, {
    message: "Nome precisa ter pelo menos 2 caracteres.",
  }),
  avatar: z.string().optional(),
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
  const { userCompanies, forceGetUserCompanies } = useCompanies();
  const [avatarPreview, setAvatarPreview] = useState<string>("https://i.pravatar.cc/150?img=68");
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const { toast } = useToast();

  const form = useForm<UserProfileFormValues>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      name: "",
      avatar: "https://i.pravatar.cc/150?img=68",
    },
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        name: userProfile.display_name || email?.split('@')[0] || "",
        avatar: userProfile.avatar || "https://i.pravatar.cc/150?img=68"
      });
      
      if (userProfile.avatar) {
        setAvatarPreview(userProfile.avatar);
      }
    }
  }, [userProfile, email, form]);

  // Carregar empresas quando o dialog abre - uma única vez
  useEffect(() => {
    if (isOpen && user?.id && userCompanies.length === 0) {
      console.log('[ProfileDialog] Loading companies for user:', user.id);
      setIsLoadingCompanies(true);
      forceGetUserCompanies(user.id).finally(() => {
        setIsLoadingCompanies(false);
      });
    }
  }, [isOpen, user?.id, userCompanies.length, forceGetUserCompanies]);

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'avatar' && value.avatar) {
        setAvatarPreview(value.avatar);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

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
      
      setIsOpen(false);
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent 
        className="sm:max-w-[425px] overflow-y-auto max-h-[85vh]"
        style={{ pointerEvents: 'auto' }}
      >
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription>
            Atualize suas informações de perfil aqui.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleProfileUpdate)} className="space-y-6">
            <div className="flex flex-col items-center gap-4 mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarPreview} alt="Avatar preview" />
                <AvatarFallback>{form.getValues().name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              
              <div className="flex items-center gap-2">
                <label htmlFor="avatar-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
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
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu nome" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="border-t pt-4">
              {isLoadingCompanies ? (
                <div className="flex items-center justify-center p-4">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                  <span className="ml-2 text-sm text-muted-foreground">Carregando empresas...</span>
                </div>
              ) : (
                <CompanyManagementSection 
                  userCompanies={userCompanies} 
                  allowUnlink={true}
                />
              )}
            </div>
            
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar alterações</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
