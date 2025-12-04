import React, { useState, useEffect, useCallback, memo } from "react";
import { Building, ChevronDown, User, LogOut, Crown, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { useIsAdmin } from "@/hooks/company/useIsAdmin";
import { useUserCompanyRole } from "@/hooks/company/useUserCompanyRole";
import { getInitials } from "@/utils/stringUtils";
import { getAvatarUrl } from "@/utils/avatarUtils";
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
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileDialog } from "@/components/profile/ProfileDialog";
import { toast } from "sonner";

export type DropdownMode = "company" | "user" | "both";

interface StandardDropdownSelectorProps {
  /**
   * Modo do dropdown: apenas empresa, apenas usuário, ou ambos
   * @default "both"
   */
  mode?: DropdownMode;
  
  /**
   * Se deve mostrar o avatar do usuário quando mode incluir "user"
   * @default true
   */
  showUserAvatar?: boolean;
  
  /**
   * Se deve mostrar informações detalhadas do usuário no dropdown
   * @default true
   */
  showUserDetails?: boolean;
  
  /**
   * Se deve mostrar o botão de logout no dropdown do usuário
   * @default true
   */
  showLogout?: boolean;
  
  /**
   * Classe CSS customizada para o trigger
   */
  triggerClassName?: string;
  
  /**
   * Alinhamento do dropdown
   * @default "start"
   */
  align?: "start" | "center" | "end";
  
  /**
   * Callback quando uma empresa é selecionada
   */
  onCompanySelect?: (company: any) => void;
  
  /**
   * Callback quando o perfil do usuário é aberto
   */
  onProfileOpen?: () => void;
  
  /**
   * Callback quando o logout é acionado
   */
  onLogout?: () => void;
}

/**
 * Componente padrão de dropdown para seleção de empresa e visualização de informações do usuário
 * 
 * @example
 * ```tsx
 * // Apenas seleção de empresa
 * <StandardDropdownSelector mode="company" />
 * 
 * // Apenas informações do usuário
 * <StandardDropdownSelector mode="user" />
 * 
 * // Ambos (padrão)
 * <StandardDropdownSelector mode="both" />
 * ```
 */
export const StandardDropdownSelector = memo(({
  mode = "both",
  showUserAvatar = true,
  showUserDetails = true,
  showLogout = true,
  triggerClassName = "",
  align = "start",
  onCompanySelect,
  onProfileOpen,
  onLogout,
}: StandardDropdownSelectorProps) => {
  const { user, signOut, userProfile } = useAuth();
  const { isAdmin, isSuperAdmin } = useIsAdmin();
  const { jobRole, isLoading: roleLoading } = useUserCompanyRole();
  const {
    userCompanies,
    selectedCompany,
    selectCompany,
    isLoading: companiesLoading,
    forceGetUserCompanies,
  } = useCompanies();
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userDisplayName, setUserDisplayName] = useState<string>("");
  const [companyDisplayName, setCompanyDisplayName] = useState<string>("");
  const [displayAvatar, setDisplayAvatar] = useState<string>("/lovable-uploads/54cf67d5-105d-4bf2-8396-70dcf1507021.png");

  // Atualizar nome e avatar do usuário
  useEffect(() => {
    setUserDisplayName(userProfile?.display_name || user?.email?.split('@')[0] || "Usuário");
    const validAvatar = getAvatarUrl(
      userProfile?.avatar,
      "/lovable-uploads/54cf67d5-105d-4bf2-8396-70dcf1507021.png"
    );
    setDisplayAvatar(validAvatar);
  }, [userProfile, user]);

  // Atualizar nome da empresa
  useEffect(() => {
    if (selectedCompany?.nome) {
      setCompanyDisplayName(selectedCompany.nome);
    } else if (userCompanies.length > 0) {
      setCompanyDisplayName(userCompanies[0].nome);
    } else {
      if (!companiesLoading) {
        setCompanyDisplayName("BUSINESS");
      }
    }
  }, [selectedCompany, userCompanies, companiesLoading]);

  // Listener para abrir diálogo de perfil via evento personalizado
  useEffect(() => {
    const handleOpenProfileDialog = () => {
      setIsProfileOpen(true);
    };
    
    window.addEventListener('open-profile-dialog', handleOpenProfileDialog);
    
    return () => {
      window.removeEventListener('open-profile-dialog', handleOpenProfileDialog);
    };
  }, []);

  // Listener para mudanças nas relações de empresa
  useEffect(() => {
    const handleCompanyRelationChange = async () => {
      if (user?.id) {
        await forceGetUserCompanies(user.id);
      }
    };
    
    window.addEventListener('company-relation-changed', handleCompanyRelationChange);
    
    return () => {
      window.removeEventListener('company-relation-changed', handleCompanyRelationChange);
    };
  }, [user?.id, forceGetUserCompanies]);

  const handleCompanySelect = useCallback((company: any) => {
    if (!company || !user?.id) return;
    
    selectCompany(user.id, company);
    
    // Disparar evento personalizado
    const event = new CustomEvent('company-selector-changed', { 
      detail: { company } 
    });
    window.dispatchEvent(event);
    
    toast.success(`Empresa ${company.nome} selecionada com sucesso!`);
    onCompanySelect?.(company);
  }, [user?.id, selectCompany, onCompanySelect]);

  const handleProfileUpdate = useCallback((values: any) => {
    setUserDisplayName(values.name);
    if (values.avatar) {
      setDisplayAvatar(values.avatar);
    }
  }, []);

  const handleOpenProfile = useCallback(() => {
    setIsProfileOpen(true);
    onProfileOpen?.();
  }, [onProfileOpen]);

  const handleLogout = useCallback(() => {
    if (onLogout) {
      onLogout();
    } else {
      signOut();
    }
  }, [onLogout, signOut]);

  const hasMultipleCompanies = userCompanies.length > 1;

  // Escutar mudanças de empresa vindas de outras partes da aplicação
  useEffect(() => {
    const handleCompanyUpdate = (event: CustomEvent) => {
      const { company } = event.detail;
      if (company?.nome) {
        setCompanyDisplayName(company.nome);
      }
    };

    window.addEventListener('company-updated', handleCompanyUpdate as EventListener);
    window.addEventListener('company-changed', handleCompanyUpdate as EventListener);
    window.addEventListener('company-selected', handleCompanyUpdate as EventListener);
    
    return () => {
      window.removeEventListener('company-updated', handleCompanyUpdate as EventListener);
      window.removeEventListener('company-changed', handleCompanyUpdate as EventListener);
      window.removeEventListener('company-selected', handleCompanyUpdate as EventListener);
    };
  }, []);

  // Renderizar apenas empresa
  if (mode === "company") {

    // Durante o loading, mostrar empresa se disponível
    if (companiesLoading) {
      if (selectedCompany?.nome) {
        return (
          <span className="text-lg font-bold text-foreground">{selectedCompany.nome}</span>
        );
      }
      if (userCompanies.length > 0) {
        return (
          <span className="text-lg font-bold text-foreground">{userCompanies[0].nome}</span>
        );
      }
      return <span className="text-lg font-bold text-foreground"></span>;
    }

    if (!user || userCompanies.length === 0) {
      return <span className="text-lg font-bold text-foreground">BUSINESS</span>;
    }

    if (userCompanies.length === 1) {
      return (
        <span className="text-lg font-bold text-foreground">{companyDisplayName}</span>
      );
    }

    // Não renderizar o dropdown se displayName está vazio (evita flash)
    if (!companyDisplayName) {
      return <span className="text-lg font-bold text-foreground"></span>;
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className={`flex items-center space-x-2 text-lg font-bold text-foreground focus:outline-none hover:opacity-80 transition-opacity ${triggerClassName}`}>
            <span>{companyDisplayName}</span>
            <ChevronDown className="ml-1 h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={align === "start" ? "start" : align} className="bg-white dark:bg-gray-800 z-50 min-w-[180px]">
          {userCompanies.map((company) => (
            <DropdownMenuItem
              key={company.id}
              onClick={() => handleCompanySelect(company)}
              className={`cursor-pointer ${selectedCompany?.id === company.id ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
            >
              <div className="flex items-center w-full">
                {company.logo ? (
                  <img
                    src={company.logo}
                    alt={company.nome}
                    className="h-4 w-4 mr-2 object-contain rounded-lg flex-shrink-0"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      // Show initials fallback
                      const parent = target.parentElement;
                      if (parent) {
                        const initialsDiv = document.createElement('div');
                        initialsDiv.className = "h-4 w-4 mr-2 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-medium flex-shrink-0";
                        initialsDiv.textContent = getInitials(company.nome);
                        parent.insertBefore(initialsDiv, target);
                      }
                    }}
                  />
                ) : (
                  <div className="h-4 w-4 mr-2 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-medium flex-shrink-0">
                    {getInitials(company.nome)}
                  </div>
                )}
                <span className="truncate">{company.nome}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Renderizar apenas usuário
  if (mode === "user") {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`relative rounded-full overflow-hidden ${triggerClassName}`}
            >
              {showUserAvatar ? (
                <img
                  src={displayAvatar}
                  alt="User avatar"
                  className="h-8 w-8 rounded-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== "/lovable-uploads/54cf67d5-105d-4bf2-8396-70dcf1507021.png") {
                      target.src = "/lovable-uploads/54cf67d5-105d-4bf2-8396-70dcf1507021.png";
                    }
                  }}
                />
              ) : (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={displayAvatar} alt={displayName} />
                  <AvatarFallback>{getInitials(userDisplayName)}</AvatarFallback>
                </Avatar>
              )}
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={align === "start" ? "end" : align} className="w-56 bg-white dark:bg-gray-800 z-50">
            {showUserDetails && (
              <>
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {userDisplayName}
                    </p>
                    {isAdmin && (
                      <Badge
                        variant={isSuperAdmin ? "default" : "secondary"}
                        className={`flex items-center gap-1 text-xs font-medium px-1.5 py-0 ${
                          isSuperAdmin
                            ? "bg-sky-500 text-white"
                            : "bg-amber-500 text-white"
                        }`}
                      >
                        {isSuperAdmin ? (
                          <Shield className="h-2.5 w-2.5" />
                        ) : (
                          <Crown className="h-2.5 w-2.5" />
                        )}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                    {user?.email}
                  </p>
                  {!roleLoading && jobRole && (
                    <div className="flex items-center mt-2">
                      <Badge variant="outline" className="flex items-center gap-1 text-xs font-normal">
                        <Building className="h-3 w-3" />
                        {jobRole.title}
                      </Badge>
                    </div>
                  )}
                </div>
                <DropdownMenuSeparator />
              </>
            )}
            
            <DropdownMenuItem
              className="cursor-pointer flex items-center gap-2"
              onClick={handleOpenProfile}
            >
              <User className="h-4 w-4" />
              <span>Editar Perfil</span>
            </DropdownMenuItem>
            
            {showLogout && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer flex items-center gap-2 text-red-600 focus:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </>
            )}
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
  }

  // Renderizar ambos (modo padrão)
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`relative rounded-full overflow-hidden ${triggerClassName}`}
          >
            {showUserAvatar ? (
              <img
                src={displayAvatar}
                alt="User avatar"
                className="h-8 w-8 rounded-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== "/lovable-uploads/54cf67d5-105d-4bf2-8396-70dcf1507021.png") {
                    target.src = "/lovable-uploads/54cf67d5-105d-4bf2-8396-70dcf1507021.png";
                  }
                }}
              />
            ) : (
              <Avatar className="h-8 w-8">
                <AvatarImage src={displayAvatar} alt={userDisplayName} />
                <AvatarFallback>{getInitials(userDisplayName)}</AvatarFallback>
              </Avatar>
            )}
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={align === "start" ? "end" : align} className="w-56 bg-white dark:bg-gray-800 z-50">
          {showUserDetails && (
            <>
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {userDisplayName}
                    </p>
                  {isAdmin && (
                    <Badge
                      variant={isSuperAdmin ? "default" : "secondary"}
                      className={`flex items-center gap-1 text-xs font-medium px-1.5 py-0 ${
                        isSuperAdmin
                          ? "bg-sky-500 text-white"
                          : "bg-amber-500 text-white"
                      }`}
                    >
                      {isSuperAdmin ? (
                        <Shield className="h-2.5 w-2.5" />
                      ) : (
                        <Crown className="h-2.5 w-2.5" />
                      )}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                  {user?.email}
                </p>
                {!roleLoading && jobRole && (
                  <div className="flex items-center mt-2">
                    <Badge variant="outline" className="flex items-center gap-1 text-xs font-normal">
                      <Building className="h-3 w-3" />
                      {jobRole.title}
                    </Badge>
                  </div>
                )}
              </div>
              <DropdownMenuSeparator />
            </>
          )}

          {hasMultipleCompanies && (
            <>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  <span className="truncate">
                    {companiesLoading
                      ? "Carregando..."
                      : selectedCompany?.nome || "Selecionar Empresa"}
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
                          {company.logo ? (
                            <img
                              src={company.logo}
                              alt={company.nome}
                              className="h-4 w-4 mr-2 object-contain rounded"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/placeholder.svg";
                                target.onerror = null;
                              }}
                            />
                          ) : (
                            <div className="h-4 w-4 mr-2 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-medium">
                              {getInitials(company.nome)}
                            </div>
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
            onClick={handleOpenProfile}
          >
            <User className="h-4 w-4" />
            <span>Editar Perfil</span>
          </DropdownMenuItem>

          {showLogout && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer flex items-center gap-2 text-red-600 focus:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </>
          )}
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
});

StandardDropdownSelector.displayName = "StandardDropdownSelector";

