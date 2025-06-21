
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, UserRound, Mail, Calendar, Crown, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/hooks/useUsers";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ReturnFeedbackDialog } from "@/components/feedback/ReturnFeedbackDialog";

interface TeamMemberCardProps {
  member: UserProfile;
  companyColor: string;
  showAdminBadge?: boolean;
  roleName?: string;
}

export const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  member,
  companyColor,
  showAdminBadge = false,
  roleName
}) => {
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
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-xl">
      <div 
        className="h-24" 
        style={{ 
          background: `linear-gradient(to right, ${companyColor}20, ${companyColor}10)`,
        }}
      ></div>
      <CardContent className="pt-0">
        <div className="flex flex-col">
          {/* Profile section */}
          <div className="flex items-start -mt-8">
            <Avatar className="h-16 w-16 border-4 border-white dark:border-gray-900 rounded-full shadow-sm">
              <AvatarImage src={member.avatar || undefined} alt={member.display_name || ''} />
              <AvatarFallback 
                className="text-xl"
                style={{ 
                  backgroundColor: `${companyColor}20`,
                  color: companyColor
                }}
              >
                {member.display_name?.substring(0, 2).toUpperCase() || <UserRound className="h-6 w-6" />}
              </AvatarFallback>
            </Avatar>
          </div>
          
          {/* User info */}
          <div className="mt-3 space-y-1.5">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-xl">
                {member.display_name || 'Usuário'}
              </h3>
              
              {(showAdminBadge || member.is_admin) && (
                <span 
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium gap-1"
                  style={{ 
                    backgroundColor: `${companyColor}20`,
                    color: companyColor
                  }}
                >
                  <Crown className="h-3 w-3" />
                  Admin
                </span>
              )}
            </div>
            
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {member.email}
            </div>

            {/* Role display */}
            {roleName && !member.is_admin && (
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Briefcase className="h-4 w-4" style={{ color: companyColor }} />
                <span>{roleName}</span>
              </div>
            )}
            
            {/* Meta info */}
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-2">
              <Calendar className="h-3 w-3" />
              <span>{formatJoinDate(member.created_at)}</span>
            </div>
            
            {/* Social actions */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <ReturnFeedbackDialog
                toUser={member}
                trigger={
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-full gap-1.5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-opacity-10"
                    style={{
                      backgroundColor: "transparent",
                      borderColor: `${companyColor}30`,
                      color: "currentColor"
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Feedback
                  </Button>
                }
              />
              
              <Button
                variant="outline"
                size="sm"
                className="flex-1 rounded-full gap-1.5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-opacity-10"
                style={{
                  backgroundColor: "transparent",
                  borderColor: `${companyColor}30`,
                  color: "currentColor"
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `mailto:${member.email}`;
                }}
              >
                <Mail className="h-4 w-4" />
                Contato
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
