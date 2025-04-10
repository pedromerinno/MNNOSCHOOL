
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload, Building, Key, UserPlus } from "lucide-react";

// Form validation schema
const onboardingSchema = z.object({
  displayName: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  avatarUrl: z.string().optional(),
  joinType: z.enum(["join", "create"]),
  companyToken: z.string().optional(),
  companyName: z.string().optional(),
  companyDescription: z.string().optional(),
}).refine(data => {
  // If joining company, token is required
  if (data.joinType === "join") {
    return !!data.companyToken;
  }
  // If creating company, name is required
  if (data.joinType === "create") {
    return !!data.companyName;
  }
  return true;
}, {
  message: "Informações da empresa são obrigatórias",
  path: ["companyToken"],
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

export const OnboardingForm = () => {
  const { user, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      displayName: "",
      avatarUrl: "",
      joinType: "join",
      companyToken: "",
      companyName: "",
      companyDescription: "",
    },
  });
  
  const joinType = form.watch("joinType");
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setAvatarFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return null;
    
    try {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, avatarFile);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);
        
      return publicUrlData.publicUrl;
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Erro ao fazer upload da imagem",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };
  
  const createCompany = async (name: string, description?: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .insert({
          nome: name,
          frase_institucional: description || null,
        })
        .select('id')
        .single();
        
      if (error) throw error;
      
      return data.id;
    } catch (error: any) {
      console.error("Error creating company:", error);
      toast({
        title: "Erro ao criar empresa",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };
  
  const associateUserWithCompany = async (companyId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('user_empresa')
        .insert({
          user_id: user.id,
          empresa_id: companyId,
        });
        
      if (error) throw error;
      
      return true;
    } catch (error: any) {
      console.error("Error associating user with company:", error);
      toast({
        title: "Erro ao associar usuário à empresa",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };
  
  const findCompanyByToken = async (token: string): Promise<string | null> => {
    try {
      // In a real application, you'd have a proper tokens table
      // For this example, we'll simplify and use a company ID as the token
      const { data, error } = await supabase
        .from('empresas')
        .select('id')
        .eq('id', token)
        .single();
        
      if (error) throw error;
      
      return data.id;
    } catch (error: any) {
      console.error("Error finding company:", error);
      toast({
        title: "Token de empresa inválido",
        description: "Não foi possível encontrar uma empresa com este token",
        variant: "destructive",
      });
      return null;
    }
  };
  
  const onSubmit = async (values: OnboardingFormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // 1. Upload avatar if provided
      let avatarUrl = null;
      if (avatarFile) {
        avatarUrl = await uploadAvatar();
      }
      
      // 2. Handle company association
      let companyId = null;
      
      if (values.joinType === "join" && values.companyToken) {
        // Find company by token
        companyId = await findCompanyByToken(values.companyToken);
        if (!companyId) {
          setIsSubmitting(false);
          return;
        }
      } else if (values.joinType === "create" && values.companyName) {
        // Create new company
        companyId = await createCompany(values.companyName, values.companyDescription);
        if (!companyId) {
          setIsSubmitting(false);
          return;
        }
      }
      
      // 3. Associate user with company if applicable
      if (companyId) {
        const success = await associateUserWithCompany(companyId);
        if (!success) {
          setIsSubmitting(false);
          return;
        }
      }
      
      // 4. Update user profile
      await updateUserProfile({
        displayName: values.displayName,
        avatar: avatarUrl,
        isAdmin: values.joinType === "create", // Make creator an admin
      });
      
      // Show success message
      toast({
        title: "Perfil atualizado com sucesso!",
        description: "Bem-vindo à plataforma",
      });
      
      // Trigger company relation change event to refresh data
      window.dispatchEvent(new Event('company-relation-changed'));
      
      // Navigate to dashboard
      navigate("/");
      
    } catch (error: any) {
      console.error("Error in onboarding process:", error);
      toast({
        title: "Erro ao completar o onboarding",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="w-full max-w-md">
      <h2 className="text-3xl font-medium mb-1">Complete seu perfil</h2>
      <p className="text-sm text-gray-500 mb-8">
        Configure seu perfil para começar a usar a plataforma.
      </p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Personal Information Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Suas informações</h3>
            
            {/* Avatar Upload */}
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarPreview || ""} />
                <AvatarFallback className="bg-merinno-dark text-white text-xl">
                  {form.getValues("displayName")?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              
              <div className="relative">
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("avatar")?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Carregar foto
                </Button>
              </div>
            </div>
            
            {/* Display Name */}
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome completo</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="bg-transparent border-b border-gray-300 rounded-none px-0 h-10 focus-visible:ring-0 focus-visible:border-merinno-dark"
                      placeholder="Seu nome completo"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Company Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Empresa</h3>
            
            {/* Join or Create Company */}
            <Tabs defaultValue="join" onValueChange={(value) => form.setValue("joinType", value as "join" | "create")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="join">
                  <Key className="h-4 w-4 mr-2" />
                  Entrar em uma empresa
                </TabsTrigger>
                <TabsTrigger value="create">
                  <Building className="h-4 w-4 mr-2" />
                  Criar nova empresa
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="join" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="companyToken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token da empresa</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-transparent border-b border-gray-300 rounded-none px-0 h-10 focus-visible:ring-0 focus-visible:border-merinno-dark"
                          placeholder="Digite o token da empresa"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="create" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da empresa</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-transparent border-b border-gray-300 rounded-none px-0 h-10 focus-visible:ring-0 focus-visible:border-merinno-dark"
                          placeholder="Nome da sua empresa"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="companyDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frase institucional (opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="bg-transparent border border-gray-300 rounded p-2 min-h-[80px] focus-visible:ring-0 focus-visible:border-merinno-dark"
                          placeholder="Uma breve descrição da sua empresa"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>
          </div>
          
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-full bg-merinno-dark hover:bg-black text-white"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Completar cadastro
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};
