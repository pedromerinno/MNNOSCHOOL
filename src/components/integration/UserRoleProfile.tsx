
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
      return format(new Date(dateString), 'dd MMM, yyyy', {
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
      return format(new Date(dateString), 'dd \'de\' MMMM', {
        locale: ptBR
      });
    } catch (error) {
      return "";
    }
  };
  
  return (
    <Card className="border-0 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-gray-900">
      <CardContent className="p-0">
        <div className="flex flex-col">
          {/* Compact Header */}
          <div 
            className="relative py-8 px-6"
            style={{
              background: `linear-gradient(135deg, ${companyColor}08 0%, transparent 100%)`
            }}
          >
            <div className="flex items-center justify-center gap-6">
              {/* Avatar with company logo */}
              <div className="relative">
                <Avatar className="w-16 h-16 ring-2 ring-white shadow-md">
                  <AvatarImage src={userProfile.avatar || undefined} alt={userProfile.display_name || "User"} />
                  <AvatarFallback 
                    className="text-white font-semibold"
                    style={{ backgroundColor: companyColor }}
                  >
                    {getInitials(userProfile.display_name)}
                  </AvatarFallback>
                </Avatar>
                
                {/* Company logo positioned at the same level */}
                <div 
                  className="absolute -right-8 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-md border"
                  style={{ borderColor: companyColor }}
                >
                  <img 
                    src={selectedCompany?.logo || "/placeholder.svg"} 
                    alt="Company Logo" 
                    className="w-6 h-6 object-cover rounded-full" 
                    onError={e => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.svg";
                    }} 
                  />
                </div>
              </div>
              
              {/* Name and role */}
              <div className="text-center">
                <h1 className="text-2xl font-bold" style={{ color: companyColor }}>
                  {userProfile.display_name?.toUpperCase() || "USUÁRIO"}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {roleTitle}
                </p>
              </div>
            </div>
          </div>

          {/* Compact Content */}
          <div className="px-6 py-6 space-y-6">
            {/* Employee Information */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                Informações do Colaborador
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nome</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {userProfile.display_name || "Não informado"}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Cidade</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {userProfile.cidade || "Não informado"}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Aniversário</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {formatBirthday(userProfile.aniversario) || "Não informado"}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nível</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {userProfile.nivel_colaborador || "Não informado"}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Contrato</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {userProfile.tipo_contrato || "Não informado"}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Início</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {formatDate(userProfile.data_inicio) || "Não informado"}
                  </p>
                </div>
              </div>
            </div>

            {/* Culture Manual Status - More compact */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                Manual de Cultura
              </h3>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 flex items-center justify-between">
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
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  userProfile.manual_cultura_aceito 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                  {userProfile.manual_cultura_aceito ? 'Aceito' : 'Pendente'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
