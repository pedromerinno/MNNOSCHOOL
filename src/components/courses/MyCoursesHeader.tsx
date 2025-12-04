import React, { useState, useEffect, useMemo, memo } from 'react';
import { SearchBar } from '@/components/navigation/SearchBar';
import { ThemeToggle } from '@/components/navigation/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useUsers } from '@/hooks/useUsers';
import { useCompanies } from '@/hooks/useCompanies';
import { getInitials } from '@/utils/stringUtils';

// Componente separado para o relógio para evitar rerenders do header
const Clock: React.FC = memo(() => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return <>{currentTime}</>;
});
Clock.displayName = 'Clock';

export const MyCoursesHeader: React.FC = memo(() => {
  const { userProfile, user } = useAuth();
  const { selectedCompany } = useCompanies();
  const { users, loading: usersLoading } = useUsers();

  const getFirstName = (name: string | null | undefined): string => {
    if (!name) return 'Usuário';
    return name.split(' ')[0];
  };

  const firstName = getFirstName(userProfile?.display_name);
  const userInitials = userProfile?.display_name
    ? getInitials(userProfile.display_name)
    : 'U';

  // Filtrar e limitar usuários da empresa (excluir o usuário atual e pegar exatamente 3)
  const companyUsers = useMemo(() => {
    // Se não há empresa selecionada, não mostrar usuários
    if (!selectedCompany?.id) return [];
    
    // Se ainda está carregando ou não há usuários, retornar vazio
    if (usersLoading || !users || users.length === 0) return [];
    
    // Filtrar usuário atual
    const otherUsers = users.filter(u => u.id !== user?.id);
    
    // Pegar exatamente 3 usuários para exibir
    return otherUsers.slice(0, 3);
  }, [users, user?.id, selectedCompany?.id, usersLoading]);

  return (
    <div className="mb-8">
      {/* Desktop Layout */}
      <div className="hidden md:flex items-center justify-between gap-4">
        {/* Left: Greeting */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
            Olá, {firstName}
          </h1>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-md mx-4">
          <SearchBar />
        </div>

        {/* Right: Time, Theme Toggle, User Avatars */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Time */}
          <div className="text-lg font-medium text-gray-700 dark:text-gray-300">
            <Clock />
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Avatars - Exatamente 3 avatares da empresa, todos do mesmo tamanho */}
          <div 
            className="flex items-center -space-x-2"
            key={`avatars-${selectedCompany?.id || 'no-company'}`}
          >
            {!usersLoading && companyUsers.length > 0 ? (
              companyUsers.map((companyUser) => (
                <Avatar
                  key={`${selectedCompany?.id}-${companyUser.id}`}
                  className="h-10 w-10 border-2 border-white dark:border-gray-800"
                >
                  {companyUser.avatar ? (
                    <AvatarImage 
                      src={companyUser.avatar} 
                      alt={companyUser.display_name || 'Usuário'} 
                    />
                  ) : (
                    <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-sm font-semibold">
                      {getInitials(companyUser.display_name || companyUser.email || 'U')}
                    </AvatarFallback>
                  )}
                </Avatar>
              ))
            ) : usersLoading ? (
              // Placeholder enquanto carrega
              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 animate-pulse"></div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Olá, {firstName}
          </h1>
          <div className="flex items-center gap-3">
            <div className="text-base font-medium text-gray-700 dark:text-gray-300">
              <Clock />
            </div>
            <ThemeToggle />
          </div>
        </div>
        <div className="w-full">
          <SearchBar />
        </div>
      </div>
    </div>
  );
});
MyCoursesHeader.displayName = 'MyCoursesHeader';

