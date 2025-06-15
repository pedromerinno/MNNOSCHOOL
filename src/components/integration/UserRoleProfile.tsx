
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
    if (!dateString) return "";
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', {
        locale: ptBR
      });
    } catch (error) {
      return "";
    }
  };

  // Format birthday date (only day and month)
  const formatBirthday = (dateString?: string | null): string => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), 'dd/MM', {
        locale: ptBR
      });
    } catch (error) {
      return "";
    }
  };
  
  return (
    <Card className="border shadow-sm">
      <CardContent className="p-6">
        {/* Header compacto */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <Avatar className="w-16 h-16">
              <AvatarImage src={userProfile.avatar || undefined} alt={userProfile.display_name || "User"} />
              <AvatarFallback 
                className="text-white font-semibold"
                style={{ backgroundColor: companyColor }}
              >
                {getInitials(userProfile.display_name)}
              </AvatarFallback>
            </Avatar>
            
            {/* Logo da empresa */}
            <div 
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center bg-white shadow-sm border"
              style={{ borderColor: companyColor }}
            >
              <img 
                src={selectedCompany?.logo || "/placeholder.svg"} 
                alt="Company Logo" 
                className="w-4 h-4 object-cover rounded-full" 
                onError={e => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg";
                }} 
              />
            </div>
          </div>
          
          <div>
            <h1 className="text-xl font-bold" style={{ color: companyColor }}>
              {userProfile.display_name || "USUÁRIO"}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {roleTitle}
            </p>
          </div>
        </div>

        {/* Informações em grid compacto */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Cidade</p>
            <p className="text-sm font-medium">{userProfile.cidade || "—"}</p>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Aniversário</p>
            <p className="text-sm font-medium">{formatBirthday(userProfile.aniversario) || "—"}</p>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Nível</p>
            <p className="text-sm font-medium">{userProfile.nivel_colaborador || "—"}</p>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Contrato</p>
            <p className="text-sm font-medium">{userProfile.tipo_contrato || "—"}</p>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Início</p>
            <p className="text-sm font-medium">{formatDate(userProfile.data_inicio) || "—"}</p>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Manual</p>
            <div className="flex items-center gap-1">
              <div 
                className={`w-2 h-2 rounded-full ${
                  userProfile.manual_cultura_aceito ? 'bg-green-500' : 'bg-yellow-500'
                }`}
              />
              <span className="text-xs font-medium">
                {userProfile.manual_cultura_aceito ? 'Aceito' : 'Pendente'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
