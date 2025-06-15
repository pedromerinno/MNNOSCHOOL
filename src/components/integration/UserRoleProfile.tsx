
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
  
  // Calculate lighter color for background
  const getLighterColor = (color: string, opacity: number = 0.1): string => {
    // If color is a hex code
    if (color.startsWith('#')) {
      return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
    }
    // If color is an RGB value
    return `${color.split(')')[0]}, ${opacity})`;
  };
  
  return (
    <Card className="border border-blue-100 dark:border-blue-900/30 shadow-sm rounded-2xl" 
         style={{ 
           backgroundColor: getLighterColor(companyColor, 0.05),
           borderColor: getLighterColor(companyColor, 0.2)
         }}>
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col">
          {/* Header with user name and role */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div className="flex flex-col mb-4 md:mb-0">
              <h2 className="text-2xl font-bold text-blue-600" style={{
                color: companyColor
              }}>
                {userProfile.display_name?.toUpperCase() || "USUÁRIO"}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{roleTitle}</p>
            </div>
            <div className="flex items-center relative">
              <Avatar className="h-16 w-16 z-10">
                <AvatarImage src={userProfile.avatar || undefined} alt={userProfile.display_name || "User"} />
                <AvatarFallback className="bg-gray-200 text-gray-700">
                  {getInitials(userProfile.display_name)}
                </AvatarFallback>
              </Avatar>
              <div className="h-16 w-16 rounded-full flex items-center justify-center overflow-hidden bg-white shadow-lg ml-[-12px] mt-2" style={{
                border: `3px solid ${companyColor}`
              }}>
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

          {/* Information sections */}
          <div className="space-y-10">
            {/* User information section */}
            <div>
              <div className="rounded-xl py-2 px-4 mb-8" style={{ 
                backgroundColor: getLighterColor(companyColor, 0.15),
              }}>
                <h3 style={{
                  color: companyColor
                }} className="text-sm font-semibold text-blue-600 text-center py-[20px]">
                  INFORMAÇÕES DO COLABORADOR
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10 px-4">
                <div>
                  <p className="text-gray-500 text-sm mb-2">Nome</p>
                  <p className="text-blue-600 font-medium" style={{
                    color: companyColor
                  }}>
                    {userProfile.display_name || "Não informado"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm mb-2">Cidade</p>
                  <p className="text-gray-700 dark:text-gray-300 font-medium">
                    {userProfile.cidade || "Não informado"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm mb-2">Aniversário</p>
                  <p className="text-gray-700 dark:text-gray-300 font-medium">
                    {formatBirthday(userProfile.aniversario) || "Não informado"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm mb-2">Nível</p>
                  <p className="text-gray-700 dark:text-gray-300 font-medium">
                    {userProfile.nivel_colaborador || "Não informado"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm mb-2">Tipo de Contrato</p>
                  <p className="text-gray-700 dark:text-gray-300 font-medium">
                    {userProfile.tipo_contrato || "Não informado"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm mb-2">Data de Início</p>
                  <p className="text-gray-700 dark:text-gray-300 font-medium">
                    {formatDate(userProfile.data_inicio) || "Não informado"}
                  </p>
                </div>
              </div>
            </div>

            {/* Manual de cultura status */}
            <div>
              <div className="rounded-xl py-2 px-4 mb-8" style={{ 
                backgroundColor: getLighterColor(companyColor, 0.15),
              }}>
                <h3 style={{
                  color: companyColor
                }} className="text-sm font-semibold text-blue-600 text-center py-[20px]">
                  STATUS DO MANUAL DE CULTURA
                </h3>
              </div>

              <div className="px-4">
                <div className="flex items-center justify-between p-4 rounded-xl border">
                  <span className="text-gray-700 dark:text-gray-300">Manual de Cultura</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    userProfile.manual_cultura_aceito 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {userProfile.manual_cultura_aceito ? 'Aceito' : 'Pendente'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
