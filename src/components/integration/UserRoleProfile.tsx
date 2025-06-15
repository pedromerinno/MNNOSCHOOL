
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
    <Card className="border-0 shadow-lg rounded-3xl overflow-hidden bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <CardContent className="p-0">
        <div className="flex flex-col">
          {/* Header com perfil elegante */}
          <div 
            className="relative py-20 px-8"
            style={{
              background: `linear-gradient(135deg, ${companyColor}12 0%, ${companyColor}08 50%, transparent 100%)`
            }}
          >
            {/* User profile section centered */}
            <div className="text-center max-w-4xl mx-auto">
              {/* Avatar e logo da empresa */}
              <div className="flex justify-center items-center mb-8">
                <div className="relative">
                  <Avatar className="w-24 h-24 ring-4 ring-white shadow-xl">
                    <AvatarImage src={userProfile.avatar || undefined} alt={userProfile.display_name || "User"} />
                    <AvatarFallback 
                      className="text-white font-bold text-xl"
                      style={{ backgroundColor: companyColor }}
                    >
                      {getInitials(userProfile.display_name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Logo da empresa posicionado elegantemente */}
                  <div 
                    className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-lg border-2"
                    style={{ borderColor: companyColor }}
                  >
                    <img 
                      src={selectedCompany?.logo || "/placeholder.svg"} 
                      alt="Company Logo" 
                      className="w-8 h-8 object-cover rounded-full" 
                      onError={e => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg";
                      }} 
                    />
                  </div>
                </div>
              </div>
              
              {/* Nome e cargo */}
              <div className="space-y-3">
                <h1 className="text-4xl font-bold tracking-tight" style={{ color: companyColor }}>
                  {userProfile.display_name?.toUpperCase() || "USUÁRIO"}
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 font-medium">
                  {roleTitle}
                </p>
                <div 
                  className="w-20 h-1 mx-auto rounded-full"
                  style={{ backgroundColor: companyColor }}
                />
              </div>
            </div>
          </div>

          {/* Content sections */}
          <div className="px-8 py-12 space-y-16">
            {/* Informações do colaborador */}
            <div>
              <div className="text-center mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Informações do Colaborador
                </h2>
                <div 
                  className="w-16 h-0.5 mx-auto rounded-full"
                  style={{ backgroundColor: companyColor }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Nome</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {userProfile.display_name || "Não informado"}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Cidade</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {userProfile.cidade || "Não informado"}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Aniversário</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {formatBirthday(userProfile.aniversario) || "Não informado"}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Nível</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {userProfile.nivel_colaborador || "Não informado"}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Tipo de Contrato</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {userProfile.tipo_contrato || "Não informado"}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Data de Início</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {formatDate(userProfile.data_inicio) || "Não informado"}
                  </p>
                </div>
              </div>
            </div>

            {/* Status do manual de cultura */}
            <div>
              <div className="text-center mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Status do Manual de Cultura
                </h2>
                <div 
                  className="w-16 h-0.5 mx-auto rounded-full"
                  style={{ backgroundColor: companyColor }}
                />
              </div>

              <div className="max-w-md mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                  <div className="flex items-center justify-center mb-4">
                    <div 
                      className={`w-4 h-4 rounded-full mr-3 ${
                        userProfile.manual_cultura_aceito 
                          ? 'bg-green-500' 
                          : 'bg-yellow-500'
                      }`}
                    />
                    <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      Manual de Cultura
                    </span>
                  </div>
                  <span className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold ${
                    userProfile.manual_cultura_aceito 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {userProfile.manual_cultura_aceito ? '✓ Aceito' : 'Pendente'}
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
