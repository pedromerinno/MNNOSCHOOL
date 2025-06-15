
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { UserProfile } from "@/types/user";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCompanies } from "@/hooks/useCompanies";

interface UserRoleProfileProps {
  userProfile: UserProfile;
  roleTitle: string;
  companyColor: string;
}

export const UserRoleProfile: React.FC<UserRoleProfileProps> = ({
  userProfile,
  roleTitle,
  companyColor
}) => {
  const { selectedCompany } = useCompanies();

  // Function to get user's initials for avatar fallback
  const getInitials = (name: string | null): string => {
    if (!name) return "U";
    return name.split(" ").map(part => part[0]).join("").toUpperCase().substring(0, 2);
  };

  // Format date if it exists
  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return "—";
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', {
        locale: ptBR
      });
    } catch (error) {
      return "—";
    }
  };

  // Format birthday date (only day and month)
  const formatBirthday = (dateString?: string | null): string => {
    if (!dateString) return "—";
    try {
      return format(new Date(dateString), 'dd/MM', {
        locale: ptBR
      });
    } catch (error) {
      return "—";
    }
  };
  
  return (
    <Card className="shadow-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <CardContent className="p-6">
        {/* Header - Cartão do Colaborador */}
        <div 
          className="relative rounded-lg p-6 mb-6"
          style={{
            background: `linear-gradient(135deg, ${companyColor}15 0%, ${companyColor}05 100%)`
          }}
        >
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <Avatar className="w-16 h-16 ring-2 ring-white shadow-md">
              <AvatarImage src={userProfile.avatar || undefined} alt={userProfile.display_name || "User"} />
              <AvatarFallback 
                className="text-white font-semibold text-lg"
                style={{ backgroundColor: companyColor }}
              >
                {getInitials(userProfile.display_name)}
              </AvatarFallback>
            </Avatar>
            
            {/* Informações principais */}
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {userProfile.display_name || "Usuário"}
              </h2>
              <p className="text-md text-gray-600 dark:text-gray-300 font-medium">
                {roleTitle}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: companyColor }}
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedCompany?.nome}
                </span>
              </div>
            </div>
            
            {/* Logo da empresa (sem bordas) */}
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-white shadow-sm">
              <img 
                src={selectedCompany?.logo || "/placeholder.svg"} 
                alt="Company Logo" 
                className="w-full h-full object-cover" 
                onError={e => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg";
                }} 
              />
            </div>
          </div>
        </div>

        {/* Informações em grid compacto */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Cidade</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {userProfile.cidade || "—"}
            </p>
          </div>

          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Aniversário</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {formatBirthday(userProfile.aniversario)}
            </p>
          </div>

          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nível</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {userProfile.nivel_colaborador || "—"}
            </p>
          </div>

          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Início</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {formatDate(userProfile.data_inicio)}
            </p>
          </div>
        </div>

        {/* Status do manual - mais compacto */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-3">
            <div 
              className={`w-3 h-3 rounded-full ${
                userProfile.manual_cultura_aceito 
                  ? 'bg-green-500' 
                  : 'bg-yellow-500'
              }`}
            />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Manual de Cultura
            </span>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
            userProfile.manual_cultura_aceito 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
          }`}>
            {userProfile.manual_cultura_aceito ? 'Aceito' : 'Pendente'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
