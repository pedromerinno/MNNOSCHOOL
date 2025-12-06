import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCompanies } from '@/hooks/useCompanies';
import { useIsAdmin } from '@/hooks/company/useIsAdmin';
import { cn, getSafeTextColor } from '@/lib/utils';
import { getInitials } from '@/utils/stringUtils';
import { getAvatarUrl } from '@/utils/avatarUtils';
import { Home, ArrowLeft, LogOut, Settings, Heart, Sparkles, TrendingUp, Users2, BookOpen, ChevronDown } from 'lucide-react';
import { CompanySelector } from '@/components/navigation/CompanySelector';
import { useSidebar } from '@/components/ui/sidebar';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MenuItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  show: boolean;
}

export const MyCoursesSidebar = () => {
  const { selectedCompany } = useCompanies();
  const { isAdmin, isSuperAdmin } = useIsAdmin();
  const { userProfile, user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { isMobile, openMobile, setOpenMobile } = useSidebar();

  const companyColor = selectedCompany?.cor_principal || '#3B82F6';
  
  // Obter dados do usuário
  const displayName = userProfile?.display_name || user?.email?.split('@')[0] || "Usuário";
  const userAvatar = getAvatarUrl(userProfile?.avatar, "/lovable-uploads/54cf67d5-105d-4bf2-8396-70dcf1507021.png");
  const userInitials = getInitials(displayName);

  const handleSignOut = () => {
    signOut();
  };

  const handleCompanySettings = () => {
    navigate('/admin?tab=settings');
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  // Verificar se está em uma rota da escola (incluindo cursos individuais)
  const isSchoolRoute = location.pathname === '/my-courses' || 
                        location.pathname === '/sugeridos' || 
                        location.pathname === '/favoritos' ||
                        location.pathname === '/performance' ||
                        location.pathname === '/professores' ||
                        location.pathname.startsWith('/my-courses') ||
                        location.pathname.startsWith('/courses/');

  // Estado para controlar o dropdown de Cursos - aberto por padrão
  const [coursesDropdownOpen, setCoursesDropdownOpen] = React.useState(true);

  // Verificar se está em uma rota de cursos (favoritos, sugeridos ou curso individual)
  const isCoursesRoute = location.pathname === '/sugeridos' || 
                         location.pathname === '/favoritos' ||
                         location.pathname.startsWith('/courses/');

  // Abrir dropdown automaticamente se estiver em uma rota de cursos
  React.useEffect(() => {
    if (isCoursesRoute) {
      setCoursesDropdownOpen(true);
    }
  }, [isCoursesRoute]);

  // Itens do menu da escola - apenas estes itens serão mostrados quando estiver na área da escola
  const schoolMenuItems: MenuItem[] = [
    {
      label: "Início",
      path: "/my-courses",
      icon: Home,
      show: true
    },
    {
      label: "Performance",
      path: "/performance",
      icon: TrendingUp,
      show: true
    },
    {
      label: "Professores",
      path: "/professores",
      icon: Users2,
      show: true
    }
  ];

  // Se estiver na área da escola, mostrar apenas os itens da escola
  const visibleItems = isSchoolRoute ? schoolMenuItems : [];

  const isActive = (path: string) => {
    if (path.includes('?')) {
      const [basePath, query] = path.split('?');
      const [locationPath, locationQuery] = location.pathname.split('?');
      if (basePath === locationPath) {
        // Se tem query params, verificar se correspondem
        const queryParams = new URLSearchParams(query);
        const locationParams = new URLSearchParams(locationQuery || '');
        for (const [key, value] of queryParams.entries()) {
          if (locationParams.get(key) === value) {
            return true;
          }
        }
        // Se não tem query params na location mas tem na rota, não está ativo
        return !locationQuery && !query;
      }
      return false;
    }
    return location.pathname === path;
  };

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full w-full bg-white dark:bg-gray-900">
      {/* Header com seletor de empresa */}
      <div className="relative border-b border-gray-200/80 dark:border-gray-800/80 px-5 py-6 flex-shrink-0 bg-white dark:bg-gray-900">
        <div className="relative flex items-center gap-3 min-w-0">
          {selectedCompany?.logo ? (
            <div className="relative flex-shrink-0">
              <img 
                src={selectedCompany.logo} 
                alt={selectedCompany.nome} 
                className="h-9 w-9 object-contain rounded-xl flex-shrink-0 ring-2 ring-gray-100 dark:ring-gray-800 transition-all duration-200 hover:ring-gray-200 dark:hover:ring-gray-700"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent && selectedCompany?.nome) {
                    const initialsDiv = document.createElement('div');
                    initialsDiv.className = "h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-xs text-primary font-semibold flex-shrink-0 ring-2 ring-gray-100 dark:ring-gray-800";
                    initialsDiv.textContent = getInitials(selectedCompany.nome);
                    parent.appendChild(initialsDiv);
                  }
                }}
              />
            </div>
          ) : selectedCompany?.nome ? (
            <div 
              className="h-9 w-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ring-2 transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: `${companyColor}15`,
                color: companyColor,
                ringColor: `${companyColor}20`,
              }}
            >
              {getInitials(selectedCompany.nome)}
            </div>
          ) : (
            <img 
              src="/lovable-uploads/200a55db-c024-40f3-b628-d48307d84e93.png" 
              alt="MNNO School" 
              className="h-9 w-9 flex-shrink-0 rounded-xl ring-2 ring-gray-100 dark:ring-gray-800"
            />
          )}
          <div className="flex-1 min-w-0 overflow-hidden">
            <CompanySelector />
          </div>
        </div>
      </div>

      {/* Conteúdo do sidebar */}
      <div className="flex-1 overflow-y-auto py-4">
        {/* Botão voltar à home */}
        <div className="px-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "w-full justify-start h-11 px-4 rounded-xl",
              "text-sm font-semibold",
              "text-gray-700 dark:text-gray-300",
              "bg-gray-50/80 dark:bg-gray-800/50",
              "hover:bg-gray-100 dark:hover:bg-gray-800",
              "hover:text-gray-900 dark:hover:text-white",
              "border border-gray-200/50 dark:border-gray-700/50",
              "transition-all duration-200",
              "shadow-sm hover:shadow-md",
              "group"
            )}
            onClick={() => {
              navigate('/');
              handleLinkClick();
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-2.5 flex-shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span>Voltar à Home</span>
          </Button>
        </div>

        {/* Separador visual */}
        <div className="px-4 mb-4">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
        </div>

        {/* Menu items */}
        <nav className="px-3 space-y-1.5">
          {/* Item Início */}
          {visibleItems.find(item => item.path === '/my-courses') && (() => {
            const item = visibleItems.find(item => item.path === '/my-courses')!;
            const active = isActive(item.path);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleLinkClick}
                className={cn(
                  "relative flex items-center w-full h-12 px-4 rounded-xl",
                  "transition-colors duration-200",
                  "text-sm font-medium",
                  "group",
                  "text-gray-700 dark:text-gray-300",
                  "hover:bg-gray-100/90 dark:hover:bg-gray-800/90",
                  "hover:text-gray-900 dark:hover:text-white",
                  active && "font-semibold",
                  active && "text-gray-900 dark:text-white"
                )}
                style={active ? {
                  backgroundColor: `${companyColor}18`,
                  color: getSafeTextColor(companyColor, false),
                } : {}}
              >
                <div 
                  className={cn(
                    "relative flex items-center justify-center w-6 h-6 transition-colors duration-200"
                  )}
                >
                  <Icon 
                    className={cn(
                      "w-5 h-5 flex-shrink-0 transition-all duration-300",
                      active ? "" : "text-gray-500/30 dark:text-gray-400/30 group-hover:text-gray-700/70 dark:group-hover:text-gray-300/70"
                    )}
                    style={active ? { 
                      color: getSafeTextColor(companyColor, false),
                    } : {}}
                  />
                </div>
                
                <span className="ml-3 flex-1 text-left truncate">{item.label}</span>
                
                {active && (
                  <div 
                    className="ml-2 w-2 h-2 rounded-full flex-shrink-0 animate-pulse" 
                    style={{ 
                      backgroundColor: companyColor,
                      boxShadow: `0 0 8px ${companyColor}60`
                    }}
                  />
                )}
              </Link>
            );
          })()}

          {/* Item Cursos com dropdown */}
          <div className="space-y-1">
            <button
              onClick={() => setCoursesDropdownOpen(!coursesDropdownOpen)}
              className={cn(
                "relative flex items-center w-full h-12 px-4 rounded-xl",
                "transition-colors duration-200",
                "text-sm font-medium",
                "group",
                "text-gray-700 dark:text-gray-300",
                "hover:bg-gray-100/90 dark:hover:bg-gray-800/90",
                "hover:text-gray-900 dark:hover:text-white",
                isCoursesRoute && "font-semibold",
                isCoursesRoute && "text-gray-900 dark:text-white"
              )}
              style={isCoursesRoute ? {
                backgroundColor: `${companyColor}18`,
                color: getSafeTextColor(companyColor, false),
              } : {}}
            >
              <div 
                className={cn(
                  "relative flex items-center justify-center w-6 h-6 transition-colors duration-200"
                )}
              >
                <BookOpen 
                  className={cn(
                    "w-5 h-5 flex-shrink-0 transition-all duration-300",
                    isCoursesRoute ? "" : "text-gray-500/30 dark:text-gray-400/30 group-hover:text-gray-700/70 dark:group-hover:text-gray-300/70"
                  )}
                  style={isCoursesRoute ? { 
                    color: getSafeTextColor(companyColor, false),
                  } : {}}
                />
              </div>
              
              <span className="ml-3 flex-1 text-left truncate">Cursos</span>
              
              <ChevronDown 
                className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  coursesDropdownOpen && "transform rotate-180"
                )}
              />
            </button>

            {/* Subitens do dropdown */}
            {coursesDropdownOpen && (
              <div className="ml-4 space-y-1 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                <Link
                  to="/favoritos"
                  onClick={handleLinkClick}
                  className={cn(
                    "relative flex items-center w-full h-10 px-4 rounded-lg",
                    "transition-colors duration-200",
                    "text-sm font-medium",
                    "group",
                    "text-gray-600 dark:text-gray-400",
                    "hover:bg-gray-100/90 dark:hover:bg-gray-800/90",
                    "hover:text-gray-900 dark:hover:text-white",
                    isActive("/favoritos") && "font-semibold",
                    isActive("/favoritos") && "text-gray-900 dark:text-white"
                  )}
                  style={isActive("/favoritos") ? {
                    backgroundColor: `${companyColor}15`,
                    color: getSafeTextColor(companyColor, false),
                  } : {}}
                >
                  <Heart className="w-4 h-4 mr-3" />
                  <span>Favoritos</span>
                </Link>
                <Link
                  to="/sugeridos"
                  onClick={handleLinkClick}
                  className={cn(
                    "relative flex items-center w-full h-10 px-4 rounded-lg",
                    "transition-colors duration-200",
                    "text-sm font-medium",
                    "group",
                    "text-gray-600 dark:text-gray-400",
                    "hover:bg-gray-100/90 dark:hover:bg-gray-800/90",
                    "hover:text-gray-900 dark:hover:text-white",
                    isActive("/sugeridos") && "font-semibold",
                    isActive("/sugeridos") && "text-gray-900 dark:text-white"
                  )}
                  style={isActive("/sugeridos") ? {
                    backgroundColor: `${companyColor}15`,
                    color: getSafeTextColor(companyColor, false),
                  } : {}}
                >
                  <Sparkles className="w-4 h-4 mr-3" />
                  <span>Sugeridos</span>
                </Link>
              </div>
            )}
          </div>

          {/* Outros itens do menu */}
          {visibleItems.filter(item => item.path !== '/my-courses').map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleLinkClick}
                className={cn(
                  "relative flex items-center w-full h-12 px-4 rounded-xl",
                  "transition-colors duration-200",
                  "text-sm font-medium",
                  "group",
                  "text-gray-700 dark:text-gray-300",
                  "hover:bg-gray-100/90 dark:hover:bg-gray-800/90",
                  "hover:text-gray-900 dark:hover:text-white",
                  active && "font-semibold",
                  active && "text-gray-900 dark:text-white"
                )}
                style={active ? {
                  backgroundColor: `${companyColor}18`,
                  color: getSafeTextColor(companyColor, false),
                } : {}}
              >
                <div 
                  className={cn(
                    "relative flex items-center justify-center w-6 h-6 transition-colors duration-200"
                  )}
                >
                  <Icon 
                    className={cn(
                      "w-5 h-5 flex-shrink-0 transition-all duration-300",
                      active ? "" : "text-gray-500/30 dark:text-gray-400/30 group-hover:text-gray-700/70 dark:group-hover:text-gray-300/70"
                    )}
                    style={active ? { 
                      color: getSafeTextColor(companyColor, false),
                    } : {}}
                  />
                </div>
                
                <span className="ml-3 flex-1 text-left truncate">{item.label}</span>
                
                {active && (
                  <div 
                    className="ml-2 w-2 h-2 rounded-full flex-shrink-0 animate-pulse" 
                    style={{ 
                      backgroundColor: companyColor,
                      boxShadow: `0 0 8px ${companyColor}60`
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer com logo e nome do usuário */}
      <div className="border-t border-gray-200/80 dark:border-gray-800/80 px-5 py-6 flex-shrink-0 bg-white dark:bg-gray-900">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-2 -m-2 transition-colors duration-200">
              {/* Avatar do usuário */}
              <Avatar className="h-10 w-10 ring-2 ring-gray-100 dark:ring-gray-800 flex-shrink-0">
                <AvatarImage src={userAvatar} alt={displayName} />
                <AvatarFallback 
                  className="text-sm font-semibold"
                  style={{
                    backgroundColor: `${companyColor}15`,
                    color: companyColor,
                  }}
                >
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              
              {/* Nome do usuário */}
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {displayName}
                </p>
                {user?.email && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.email}
                  </p>
                )}
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800 z-50 rounded-xl shadow-lg">
            <DropdownMenuItem
              onClick={handleCompanySettings}
              className="cursor-pointer"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurações da empresa
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  // Mobile: usar Sheet
  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          side="left"
          className="w-[280px] p-0 bg-white dark:bg-gray-900 border-r border-gray-200/80 dark:border-gray-800/80"
        >
          {sidebarContent}
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: sidebar fixo
  return (
    <aside 
      className="fixed left-0 top-0 h-screen w-64 z-10 hidden lg:block"
    >
      {/* Sombra elegante */}
      <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-gray-200/50 dark:via-gray-700/50 to-transparent" />
      <div 
        className="absolute inset-y-0 -right-8 w-8 bg-gradient-to-r opacity-0 dark:opacity-100 pointer-events-none"
        style={{
          background: 'linear-gradient(to right, rgba(0,0,0,0.03) 0%, transparent 100%)',
        }}
      />
      
      {/* Container com borda e sombra */}
      <div className="h-full w-full bg-white dark:bg-gray-900 border-r border-gray-200/80 dark:border-gray-800/80 shadow-[4px_0_24px_rgba(0,0,0,0.04)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.3)]">
        {sidebarContent}
      </div>
    </aside>
  );
};