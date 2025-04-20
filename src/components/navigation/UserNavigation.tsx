
import { useState, useEffect } from "react"; // Add useEffect to the import
import { useNavigate } from "react-router-dom";
import { LogOut, User, ChevronDown, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { ProfileDialog } from "@/components/profile/ProfileDialog";
import { useCompanies } from "@/hooks/useCompanies";
import { toast } from "sonner";

interface UserNavigationProps {
  avatarUrl?: string;
}

export const UserNavigation = ({ avatarUrl = "https://i.pravatar.cc/150?img=68" }: UserNavigationProps) => {
  const { user, signOut, userProfile } = useAuth();
  const [displayName, setDisplayName] = useState<string>("");
  const [displayAvatar, setDisplayAvatar] = useState<string>("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const { 
    userCompanies, 
    selectedCompany, 
    selectCompany,
    isLoading,
  } = useCompanies();
  
  useEffect(() => {
    const handleCompanyRelationChange = async () => {
      console.log('UserNavigation: Detected company relation change');
    };
    
    window.addEventListener('company-relation-changed', handleCompanyRelationChange);
    
    return () => {
      window.removeEventListener('company-relation-changed', handleCompanyRelationChange);
    };
  }, []);

  useEffect(() => {
    setDisplayName(userProfile.display_name || user?.email?.split('@')[0] || "Usuário");
    setDisplayAvatar(userProfile.avatar || avatarUrl);
  }, [userProfile, user, avatarUrl]);

  const handleProfileUpdate = (values: any) => {
    console.log("Profile updated with values:", values);
    setDisplayName(values.name);
    if (values.avatar) {
      setDisplayAvatar(values.avatar);
    }
  };

  const handleSignOut = () => {
    signOut();
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleCompanySelect = (company) => {
    if (!company || !user?.id) return;
    
    console.log('UserNavigation: Company selected', company.nome);
    selectCompany(user.id, company);
    toast.success(`Empresa ${company.nome} selecionada com sucesso!`);
  };

  const hasMultipleCompanies = userCompanies.length > 1;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative text-gray-500 hover:text-merinno-blue rounded-full overflow-hidden"
          >
            <img 
              src={displayAvatar} 
              alt="User avatar" 
              className="h-8 w-8 rounded-full object-cover"
            />
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-gray-800 z-50">
          <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {displayName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
          </div>
          
          {hasMultipleCompanies && (
            <>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  <span className="truncate">
                    {isLoading ? 'Carregando...' : (selectedCompany?.nome || 'Selecionar Empresa')}
                  </span>
                  <ChevronDown className="h-3 w-3 ml-auto" />
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="w-48 bg-white dark:bg-gray-800 z-50">
                    {userCompanies.map((company) => (
                      <DropdownMenuItem
                        key={company.id}
                        className="cursor-pointer"
                        onClick={() => handleCompanySelect(company)}
                      >
                        <div className="flex items-center w-full">
                          {company.logo && (
                            <img 
                              src={company.logo} 
                              alt={company.nome} 
                              className="h-4 w-4 mr-2 object-contain rounded-lg"
                            />
                          )}
                          <span className="truncate">{company.nome}</span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
            </>
          )}
          
          <DropdownMenuItem
            className="cursor-pointer flex items-center gap-2"
            onClick={() => setIsProfileOpen(true)}
          >
            <User className="h-4 w-4" />
            <span>Editar Perfil</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={handleHomeClick}
            className="cursor-pointer flex items-center gap-2"
          >
            <span>Início</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={handleSignOut}
            className="cursor-pointer flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileDialog
        isOpen={isProfileOpen}
        setIsOpen={setIsProfileOpen}
        email={user?.email}
        onSave={handleProfileUpdate}
      />
    </>
  );
};
