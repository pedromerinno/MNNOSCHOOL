import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { UserProfile } from "@/types/user";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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
  return <Card className="border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10 shadow-sm">
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
            <div className="flex items-center gap-3">
              <Avatar className="h-16 w-16">
                <AvatarImage src={userProfile.avatar || undefined} alt={userProfile.display_name || "User"} />
                <AvatarFallback className="bg-gray-200 text-gray-700">
                  {getInitials(userProfile.display_name)}
                </AvatarFallback>
              </Avatar>
              <div className="h-16 w-16 rounded-full flex items-center justify-center overflow-hidden bg-white" style={{
              border: `2px solid ${companyColor}`
            }}>
                {/* Company logo placeholder */}
                <img src="/placeholder.svg" alt="Company Logo" className="w-full h-full object-contain p-1" onError={e => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.svg";
              }} />
              </div>
            </div>
          </div>

          {/* Information sections */}
          <div className="space-y-10">
            {/* User information section */}
            <div>
              <div className="bg-blue-100/70 dark:bg-blue-900/20 rounded-md py-2 px-4 mb-6">
                <h3 style={{
                color: companyColor
              }} className="text-sm font-semibold text-blue-600 text-center py-[20px]">
                  INFORMAÇÕES DO COLABORADOR
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-8">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Nome</p>
                  <p className="text-blue-600" style={{
                  color: companyColor
                }}>
                    {userProfile.display_name || "Não informado"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm mb-1">Email</p>
                  <p className="text-gray-700 dark:text-gray-300">{userProfile.email || "Não informado"}</p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm mb-1">ID</p>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    {userProfile.id.substring(0, 8)}...
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm mb-1">Formato de Trabalho</p>
                  <p className="text-gray-700 dark:text-gray-300">Remoto</p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm mb-1">Tipo de Contrato</p>
                  <p className="text-gray-700 dark:text-gray-300">CLT</p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm mb-1">Data de Início</p>
                  <p className="text-gray-700 dark:text-gray-300">
                    {formatDate(userProfile.created_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* Role information section */}
            
          </div>
        </div>
      </CardContent>
    </Card>;
};