import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, UserCircle, Building2, Crown, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/company/useIsAdmin";
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
import { Badge } from "@/components/ui/badge";
import { getAvatarUrl } from "@/utils/avatarUtils";

interface UserNavigationProps {
  avatarUrl?: string;
}

export const UserNavigation = ({ avatarUrl = "/lovable-uploads/54cf67d5-105d-4bf2-8396-70dcf1507021.png" }: UserNavigationProps) => {
  const { user, signOut, userProfile } = useAuth();
  const { isAdmin, isSuperAdmin } = useIsAdmin();
  const [displayName, setDisplayName] = useState<string>("");
  const [displayAvatar, setDisplayAvatar] = useState<string>(avatarUrl);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const { 
    userCompanies, 
    selectedCompany, 
    selectCompany,
    isLoading,
    forceGetUserCompanies,
  } = useCompanies();
  
  useEffect(() => {
    const handleCompanyRelationChange = async () => {
      console.log('UserNavigation: Detected company relation change');
      // Recarregar as empresas do usuário quando houver mudanças nas vinculações
      if (user?.id) {
        await forceGetUserCompanies(user.id);
      }
    };
    
    // Listener para abrir o diálogo de perfil via evento personalizado
    const handleOpenProfileDialog = () => {
      setIsProfileOpen(true);
    };
    
    window.addEventListener('company-relation-changed', handleCompanyRelationChange);
    window.addEventListener('open-profile-dialog', handleOpenProfileDialog);
    
    return () => {
      window.removeEventListener('company-relation-changed', handleCompanyRelationChange);
      window.removeEventListener('open-profile-dialog', handleOpenProfileDialog);
    };
  }, [user?.id, forceGetUserCompanies]);

  useEffect(() => {
    setDisplayName(userProfile?.display_name || user?.email?.split('@')[0] || "Usuário");
    
    // Usar a função utilitária para obter URL do avatar com fallback
    const validAvatar = getAvatarUrl(userProfile?.avatar, avatarUrl);
    setDisplayAvatar(validAvatar);
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
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                // Se falhar ao carregar, usar o avatar padrão
                if (target.src !== avatarUrl) {
                  target.src = avatarUrl;
                }
              }}
            />
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          sideOffset={8}
          alignOffset={-8}
          className="w-72 bg-white dark:bg-gray-800 z-[100] p-0 rounded-2xl shadow-lg overflow-hidden"
        >
          {/* User Info Section */}
          <div className="px-5 pt-4 pb-3.5 border-b border-gray-100 dark:border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <img 
                  src={displayAvatar} 
                  alt="User avatar" 
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-700/50 shadow-sm"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== avatarUrl) {
                      target.src = avatarUrl;
                    }
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {displayName}
                  </p>
                  {isAdmin && (
                    <Badge 
                      variant={isSuperAdmin ? "default" : "secondary"}
                      className="flex-shrink-0 items-center gap-1.5"
                    >
                      {isSuperAdmin ? (
                        <>
                          <Shield className="h-3 w-3" />
                          <span className="text-[10px] font-semibold">Super Admin</span>
                        </>
                      ) : (
                        <>
                          <Crown className="h-3 w-3" />
                          <span className="text-[10px] font-semibold">Admin</span>
                        </>
                      )}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Options Section */}
          <div className="py-2">
            {hasMultipleCompanies && (
              <>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="cursor-pointer flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <Building2 className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    <span className="flex-1 text-left truncate">
                      {isLoading ? 'Carregando...' : (selectedCompany?.nome || 'Selecionar Empresa')}
                    </span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent 
                      sideOffset={8}
                      alignOffset={-8}
                      className="w-60 bg-white dark:bg-gray-800 z-[100] !rounded-2xl shadow-lg"
                    >
                      {userCompanies.map((company) => (
                        <DropdownMenuItem
                          key={company.id}
                          className="cursor-pointer px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          onClick={() => handleCompanySelect(company)}
                        >
                          <div className="flex items-center w-full gap-3">
                            {company.logo ? (
                              <img 
                                src={company.logo} 
                                alt={company.nome} 
                                className="h-5 w-5 object-contain rounded flex-shrink-0"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/placeholder.svg";
                                  target.onerror = null;
                                }}
                              />
                            ) : (
                              <div className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center text-xs text-primary font-semibold flex-shrink-0">
                                {company.nome.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="truncate text-sm font-medium text-gray-700 dark:text-gray-200">{company.nome}</span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSeparator className="my-2 bg-gray-100 dark:bg-gray-700/50" />
              </>
            )}
            
            <DropdownMenuItem
              className="cursor-pointer flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              onClick={() => setIsProfileOpen(true)}
            >
              <UserCircle className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              <span>Editar Perfil</span>
            </DropdownMenuItem>
          </div>

          {/* Sign Out Button Section */}
          <div className="px-5 pt-2 pb-5 border-t border-gray-100 dark:border-gray-700/50">
            <Button
              variant="outline"
              className="w-full justify-center border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 text-gray-900 dark:text-gray-100 font-medium transition-colors rounded-lg"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
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
