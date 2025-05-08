
import { UserProfile } from "@/hooks/useUsers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, UserRound, Calendar, MessageSquare, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useCompanies } from "@/hooks/useCompanies";
import { useState, useEffect } from "react";
import { ReturnFeedbackDialog } from "@/components/feedback/ReturnFeedbackDialog";

interface ProfileCardProps {
  member: UserProfile;
}

export const ProfileCard = ({ member }: ProfileCardProps) => {
  const { selectedCompany } = useCompanies();
  const [companyColor, setCompanyColor] = useState("#1EAEDB");

  // Update color whenever the selected company changes
  useEffect(() => {
    if (selectedCompany?.cor_principal) {
      setCompanyColor(selectedCompany.cor_principal);
    }
  }, [selectedCompany]);
  
  // Extract first letter of display name for avatar fallback
  const getInitial = () => {
    if (member?.display_name) {
      return member.display_name.substring(0, 1).toUpperCase();
    }
    return null;
  };
  
  // Format date for social media style display
  const formatJoinDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "'Membro desde' MMMM yyyy", { locale: ptBR });
    } catch (error) {
      return "";
    }
  };

  return (
    <Card className="overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-xl shadow-sm">
      <div 
        className="h-32"
        style={{ 
          background: `linear-gradient(to right, ${companyColor}20, ${companyColor}10)`
        }}
      ></div>
      <CardContent className="p-6 pt-0">
        <div className="flex flex-col">
          {/* Profile section */}
          <div className="flex items-start -mt-16">
            <Avatar className="h-32 w-32 border-4 border-white dark:border-gray-900 rounded-full shadow-md">
              <AvatarImage src={member?.avatar || undefined} alt={member?.display_name || ''} />
              <AvatarFallback 
                className="text-3xl"
                style={{ 
                  backgroundColor: `${companyColor}20`,
                  color: companyColor
                }}
              >
                {getInitial() || <UserRound className="h-12 w-12" />}
              </AvatarFallback>
            </Avatar>
          </div>
          
          {/* User info */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold tracking-tight">
                {member?.display_name || 'Usuário'}
              </h2>
              
              {member?.is_admin && (
                <span 
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                  style={{ 
                    backgroundColor: `${companyColor}20`,
                    color: companyColor
                  }}
                >
                  Admin
                </span>
              )}
            </div>
            
            {member?.cargo_id && (
              <p className="text-gray-600 dark:text-gray-300">
                Cargo ID: {member.cargo_id}
              </p>
            )}
            
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
              <Calendar className="h-4 w-4" />
              <span>{formatJoinDate(member.created_at)}</span>
            </div>
            
            {/* Email info */}
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Mail className="h-4 w-4" />
              <span>{member?.email}</span>
            </div>
            
            {/* Actions */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <Button
                variant="outline"
                className="gap-2 rounded-xl py-6 bg-white dark:bg-gray-800 hover:bg-opacity-10"
                style={{
                  backgroundColor: "transparent",
                  borderColor: `${companyColor}30`
                }}
                onClick={() => window.location.href = `mailto:${member?.email}`}
              >
                <Mail className="h-5 w-5" />
                Enviar email
              </Button>
              
              <ReturnFeedbackDialog
                toUser={member}
                trigger={
                  <Button
                    className="gap-2 rounded-xl py-6 text-white"
                    style={{ 
                      background: `linear-gradient(to right, ${companyColor}, ${companyColor}DD)`
                    }}
                  >
                    <MessageSquare className="h-5 w-5" />
                    Enviar feedback
                  </Button>
                }
              />
            </div>
            
            {/* Team stats */}
            <div className="flex items-center gap-2 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
              <Users className="h-4 w-4" style={{ color: companyColor }} />
              <span className="text-sm text-gray-600 dark:text-gray-300">Parte da equipe</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
