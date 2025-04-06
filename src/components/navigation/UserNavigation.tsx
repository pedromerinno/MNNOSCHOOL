import { useState, useEffect } from "react";
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
import { ProfilePopover, UserProfileFormValues } from "@/components/profile/ProfilePopover";
import { useCompanies } from "@/hooks/useCompanies";
import { Company } from "@/types/company";
import { toast } from "sonner";

interface UserNavigationProps {
  avatarUrl?: string;
}

export const UserNavigation = ({ avatarUrl = "https://i.pravatar.cc/150?img=68" }: UserNavigationProps) => {
  const { user, signOut, userProfile } = useAuth();
  const [displayName, setDisplayName] = useState<string>("");
  const [displayAvatar, setDisplayAvatar] = useState<string>("");
  const [userCompanies, setUserCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { getUserCompanies, getUserCompany, updateUserSelectedCompany } = useCompanies();
  
  // Fetch user companies and selected company
  useEffect(() => {
    const fetchUserCompanies = async () => {
      if (user?.id) {
        setLoading(true);
        try {
          // Get all companies the user is related to
          const companies = await getUserCompanies(user.id);
          console.log('Empresas do usuário:', companies);
          setUserCompanies(companies);
          
          // If there are companies, get the current one
          if (companies.length > 0) {
            const currentCompanyResult = await getUserCompany(user.id);
            console.log('Empresa atual do usuário:', currentCompanyResult);
            setSelectedCompany(currentCompanyResult.company);
          }
        } catch (error) {
          console.error('Erro ao buscar empresas do usuário:', error);
          toast.error("Não foi possível carregar as empresas. Tente novamente mais tarde.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserCompanies();
  }, [user, getUserCompanies, getUserCompany]);

  // Listen for company selection events from CompanySelector
  useEffect(() => {
    const handleCompanySelected = (event: CustomEvent) => {
      const { userId, companyId } = event.detail;
      if (userId && companyId) {
        handleCompanySelect(userCompanies.find(c => c.id === companyId) || null);
      }
    };

    window.addEventListener('company-selected', handleCompanySelected as EventListener);
    
    return () => {
      window.removeEventListener('company-selected', handleCompanySelected as EventListener);
    };
  }, [userCompanies]);

  // Update display name and avatar
  useEffect(() => {
    // Use the displayName from userProfile if available, otherwise use the email
    setDisplayName(userProfile.displayName || user?.email?.split('@')[0] || "Usuário");
    // Use the avatar from userProfile if available, otherwise use the provided avatarUrl
    setDisplayAvatar(userProfile.avatar || avatarUrl);
  }, [userProfile, user, avatarUrl]);

  const handleProfileUpdate = (values: UserProfileFormValues) => {
    // Profile update is handled by the ProfilePopover component
    // via the updateUserProfile function in AuthContext
    console.log("Profile updated with values:", values);
  };

  const handleSignOut = () => {
    signOut();
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  const handleCompanySelect = async (company: Company | null) => {
    if (!company || !user?.id) return;
    
    setSelectedCompany(company);
    
    try {
      // Atualizar a empresa selecionada no backend
      await updateUserSelectedCompany(user.id, company.id);
      toast.success(`Empresa ${company.nome} selecionada com sucesso!`);
      
      // Recarregar a página para atualizar os dados com a nova empresa
      window.location.reload();
    } catch (error) {
      console.error('Erro ao selecionar empresa:', error);
      toast.error("Não foi possível selecionar a empresa. Tente novamente.");
    }
  };

  const hasMultipleCompanies = userCompanies.length > 1;

  return (
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
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-4 py-2 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-900 truncate">
            {displayName}
          </p>
          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
        </div>
        
        {hasMultipleCompanies && (
          <>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer flex items-center gap-2">
                <Building className="h-4 w-4" />
                <span className="truncate">
                  {loading ? 'Carregando...' : (selectedCompany?.nome || 'Selecionar Empresa')}
                </span>
                <ChevronDown className="h-3 w-3 ml-auto" />
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="w-48">
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
                            className="h-4 w-4 mr-2 object-contain"
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
        
        <ProfilePopover 
          email={user?.email}
          onSave={handleProfileUpdate}
        >
          <DropdownMenuItem
            className="cursor-pointer flex items-center gap-2"
            onSelect={(e) => {
              // Prevent the dropdown from closing
              e.preventDefault();
            }}
          >
            <User className="h-4 w-4" />
            <span>Editar Perfil</span>
          </DropdownMenuItem>
        </ProfilePopover>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleDashboardClick}
          className="cursor-pointer flex items-center gap-2"
        >
          <span>Dashboard</span>
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
  );
};
