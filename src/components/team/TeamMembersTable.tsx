import React from 'react';
import { TeamMember } from "@/hooks/team/useTeamMembersOptimized";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, UserRound, Crown, Briefcase, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ReturnFeedbackDialog } from "@/components/feedback/ReturnFeedbackDialog";
import { JobRole } from "@/types/job-roles";

interface TeamMembersTableProps {
  members: TeamMember[];
  companyColor?: string;
  availableRoles?: JobRole[];
}

export const TeamMembersTable: React.FC<TeamMembersTableProps> = ({
  members,
  companyColor = "#1EAEDB",
  availableRoles = []
}) => {
  const formatJoinDate = (dateString?: string) => {
    if (!dateString) return "—";
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      return "—";
    }
  };

  const getRoleName = (roleId?: string) => {
    if (!roleId) return "—";
    const role = availableRoles.find(r => r.id === roleId);
    return role?.title || "—";
  };

  if (members.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
          <UserRound className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">
          Nenhum membro encontrado.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-900/50">
              <TableHead className="w-[60px]">Avatar</TableHead>
              <TableHead className="min-w-[150px]">Nome</TableHead>
              <TableHead className="hidden md:table-cell min-w-[200px]">Email</TableHead>
              <TableHead className="hidden lg:table-cell min-w-[120px]">Cargo</TableHead>
              <TableHead className="hidden lg:table-cell w-[100px]">Status</TableHead>
              <TableHead className="hidden xl:table-cell min-w-[120px]">Membro desde</TableHead>
              <TableHead className="text-right w-[200px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow 
                key={member.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
              >
                <TableCell>
                  <Avatar className="h-10 w-10 border-2 border-gray-200 dark:border-gray-700">
                    <AvatarImage src={member.avatar || undefined} alt={member.display_name || ''} />
                    <AvatarFallback
                      className="text-sm"
                      style={{
                        backgroundColor: `${companyColor}20`,
                        color: companyColor
                      }}
                    >
                      {member.display_name?.substring(0, 2).toUpperCase() || (
                        <UserRound className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {member.display_name || 'Usuário'}
                      </span>
                      {member.is_admin && (
                        <Badge
                          variant="outline"
                          className="gap-1 text-xs"
                          style={{
                            borderColor: `${companyColor}40`,
                            color: companyColor,
                            backgroundColor: `${companyColor}10`
                          }}
                        >
                          <Crown className="h-3 w-3" />
                          Admin
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 md:hidden">
                      {member.email}
                    </span>
                    {member.cargo_id && (
                      <div className="flex items-center gap-1.5 lg:hidden">
                        <Briefcase className="h-3 w-3" style={{ color: companyColor }} />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {getRoleName(member.cargo_id)}
                        </span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {member.email}
                  </span>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {member.cargo_id ? (
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5" style={{ color: companyColor }} />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {getRoleName(member.cargo_id)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
                  )}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <Badge
                    variant="outline"
                    className="text-xs"
                    style={{
                      borderColor: `${companyColor}30`,
                      color: companyColor,
                      backgroundColor: `${companyColor}10`
                    }}
                  >
                    Ativo
                  </Badge>
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatJoinDate(member.created_at)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <ReturnFeedbackDialog
                      toUser={member}
                      trigger={
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 h-8 text-xs"
                          style={{
                            borderColor: `${companyColor}30`,
                            color: companyColor
                          }}
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Feedback</span>
                        </Button>
                      }
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 h-8 text-xs"
                      onClick={() => window.location.href = `mailto:${member.email}`}
                      style={{
                        borderColor: `${companyColor}30`,
                        color: companyColor
                      }}
                    >
                      <Mail className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Email</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

