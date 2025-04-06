
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Bell, Search, User, LogOut, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";

const userProfileSchema = z.object({
  name: z.string().min(2, {
    message: "Nome precisa ter pelo menos 2 caracteres.",
  }),
  avatar: z.string().optional(),
});

type UserProfileFormValues = z.infer<typeof userProfileSchema>;

export const DashboardHeader = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("https://i.pravatar.cc/150?img=68");

  const form = useForm<UserProfileFormValues>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      name: user?.email?.split('@')[0] || "",
      avatar: "https://i.pravatar.cc/150?img=68",
    },
  });

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleProfileUpdate = (values: UserProfileFormValues) => {
    // This would typically update the user profile in a database
    console.log("Profile update values:", values);
    
    // Show success message
    toast({
      title: "Perfil atualizado",
      description: "Suas informações foram atualizadas com sucesso.",
    });
    
    // Close the dialog
    setIsProfileDialogOpen(false);
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

  const openProfileDialog = () => {
    setIsProfileDialogOpen(true);
  };

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-10">
          <div 
            onClick={handleLogoClick} 
            className="text-xl font-bold text-merinno-dark cursor-pointer"
          >
            MERINNO
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/dashboard"
              className="text-sm font-medium text-gray-900 hover:text-merinno-blue"
            >
              Dashboard
            </Link>
            <Link
              to="/courses"
              className="text-sm font-medium text-gray-500 hover:text-merinno-blue"
            >
              Cursos
            </Link>
            <Link
              to="/schedule"
              className="text-sm font-medium text-gray-500 hover:text-merinno-blue"
            >
              Agenda
            </Link>
            <Link
              to="/community"
              className="text-sm font-medium text-gray-500 hover:text-merinno-blue"
            >
              Comunidade
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:block relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Pesquisar..."
              className="pl-8 h-9 focus-visible:ring-merinno-blue"
            />
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="relative text-gray-500 hover:text-merinno-blue"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-gray-500 hover:text-merinno-blue rounded-full overflow-hidden"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                {user ? (
                  <img 
                    src={avatarPreview} 
                    alt="User avatar" 
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <User className="h-5 w-5" />
                )}
                {user && (
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.email}
                </p>
              </div>
              <DropdownMenuItem 
                className="cursor-pointer flex items-center gap-2"
                onClick={openProfileDialog}
              >
                <User className="h-4 w-4" />
                <span>Editar Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer flex items-center gap-2"
                onClick={() => signOut()}
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
            <DialogDescription>
              Atualize suas informações de perfil aqui.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleProfileUpdate)} className="space-y-6 py-4">
              <div className="flex flex-col items-center gap-4 mb-4">
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
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsProfileDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Salvar alterações</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </header>
  );
};
