
import { useState, useEffect } from "react";
import { Upload, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const userProfileSchema = z.object({
  displayName: z.string().min(2, {
    message: "Nome precisa ter pelo menos 2 caracteres.",
  }),
  avatarUrl: z.string().optional(),
});

export type UserProfileFormValues = z.infer<typeof userProfileSchema>;

interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export const UserProfileDialog = ({ 
  open, 
  onOpenChange, 
  onComplete 
}: UserProfileDialogProps) => {
  const { user, userProfile, updateUserProfile } = useAuth();
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<UserProfileFormValues>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      displayName: "",
      avatarUrl: "",
    },
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        displayName: userProfile.display_name || user?.email?.split('@')[0] || "",
        avatarUrl: userProfile.avatar || "",
      });
      
      if (userProfile.avatar) {
        setAvatarPreview(userProfile.avatar);
      }
    } else if (user?.email) {
      form.reset({
        displayName: user.email.split('@')[0] || "",
        avatarUrl: "",
      });
    }
  }, [userProfile, user, form]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarPreview(result);
        form.setValue("avatarUrl", result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (values: UserProfileFormValues) => {
    setIsSubmitting(true);
    
    try {
      await updateUserProfile({
        display_name: values.displayName,
        avatar: values.avatarUrl || null
      });
      
      // Show success animation
      setShowSuccess(true);
      
      // After short delay, close dialog and notify parent
      setTimeout(() => {
        setShowSuccess(false);
        onComplete();
      }, 1500);
      
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar perfil");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => {
      if (!isSubmitting) onOpenChange(value);
    }}>
      <DialogContent className="sm:max-w-md max-w-[95vw]">
        <DialogHeader>
          <DialogTitle className="text-xl">Atualize seu perfil</DialogTitle>
          <DialogDescription>
            Vamos começar com suas informações básicas
          </DialogDescription>
        </DialogHeader>

        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4 animate-scale-in" />
            <h3 className="text-lg font-medium">Perfil atualizado!</h3>
            <p className="text-gray-500 mt-2">Seus dados foram salvos com sucesso.</p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="flex flex-col items-center gap-4 mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarPreview} alt="Avatar preview" />
                  <AvatarFallback>{form.getValues().displayName?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
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
                name="displayName"
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
              
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    onComplete(); // Skip this step
                  }}
                  disabled={isSubmitting}
                >
                  Pular por agora
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};
