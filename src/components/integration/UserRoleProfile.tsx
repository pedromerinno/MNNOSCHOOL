
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
    <Card className="border border-blue-100 dark:border-blue-900/30 shadow-sm rounded-2xl overflow-hidden" 
         style={{ 
           backgroundColor: getLighterColor(companyColor, 0.05),
           borderColor: getLighterColor(companyColor, 0.2)
         }}>
      <CardContent className="p-0">
        <div className="flex flex-col">
          {/* Header with elegant background and user profile */}
          <div 
            className="py-16 px-8"
            style={{
              background: `linear-gradient(135deg, ${companyColor}08 0%, ${companyColor}03 50%, white 100%)`
            }}
          >
            {/* User profile section centered */}
            <div className="text-center mb-8 max-w-3xl mx-auto">
              <div className="flex justify-center items-center mb-6 relative">
                <Avatar className="w-20 h-20 ring-4 ring-white shadow-lg">
                  <AvatarImage src={userProfile.avatar || undefined} alt={userProfile.display_name || "User"} />
                  <AvatarFallback 
                    className="text-white font-semibold text-lg"
                    style={{ backgroundColor: companyColor }}
                  >
                    {getInitials(userProfile.display_name)}
                  </AvatarFallback>
                </Avatar>
                
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden bg-white shadow-lg ml-[-8px]"
                  style={{
                    border: `3px solid ${companyColor}`
                  }}
                >
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
              
              <h2 className="text-3xl font-bold mb-2" style={{ color: companyColor }}>
                {userProfile.display_name?.toUpperCase() || "USUÁRIO"}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">{roleTitle}</p>
              <div className="w-16 h-0.5 mx-auto mt-4" style={{ backgroundColor: companyColor }} />
            </div>
          </div>

          {/* Content sections with improved spacing */}
          <div className="p-8 space-y-12">
            {/* User information section */}
            <div>
              <div className="rounded-xl py-4 px-6 mb-8 text-center" style={{ 
                backgroundColor: getLighterColor(companyColor, 0.12),
              }}>
                <h3 style={{ color: companyColor }} className="text-sm font-semibold tracking-wide">
                  INFORMAÇÕES DO COLABORADOR
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-100 shadow-sm">
                  <p className="text-gray-500 text-sm mb-3 font-medium">Nome</p>
                  <p className="font-semibold text-lg" style={{ color: companyColor }}>
                    {userProfile.display_name || "Não informado"}
                  </p>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-100 shadow-sm">
                  <p className="text-gray-500 text-sm mb-3 font-medium">Cidade</p>
                  <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg">
                    {userProfile.cidade || "Não informado"}
                  </p>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-100 shadow-sm">
                  <p className="text-gray-500 text-sm mb-3 font-medium">Aniversário</p>
                  <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg">
                    {formatBirthday(userProfile.aniversario) || "Não informado"}
                  </p>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-100 shadow-sm">
                  <p className="text-gray-500 text-sm mb-3 font-medium">Nível</p>
                  <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg">
                    {userProfile.nivel_colaborador || "Não informado"}
                  </p>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-100 shadow-sm">
                  <p className="text-gray-500 text-sm mb-3 font-medium">Tipo de Contrato</p>
                  <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg">
                    {userProfile.tipo_contrato || "Não informado"}
                  </p>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-100 shadow-sm">
                  <p className="text-gray-500 text-sm mb-3 font-medium">Data de Início</p>
                  <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg">
                    {formatDate(userProfile.data_inicio) || "Não informado"}
                  </p>
                </div>
              </div>
            </div>

            {/* Manual de cultura status */}
            <div>
              <div className="rounded-xl py-4 px-6 mb-8 text-center" style={{ 
                backgroundColor: getLighterColor(companyColor, 0.12),
              }}>
                <h3 style={{ color: companyColor }} className="text-sm font-semibold tracking-wide">
                  STATUS DO MANUAL DE CULTURA
                </h3>
              </div>

              <div className="max-w-2xl mx-auto">
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Manual de Cultura</span>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
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
        </div>
      </CardContent>
    </Card>
  );
};
