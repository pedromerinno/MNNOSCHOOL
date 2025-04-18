
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { UserProfile } from "@/hooks/useUsers";

interface TeamMembersListProps {
  members: UserProfile[];
}

export const TeamMembersList = ({ members }: TeamMembersListProps) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {members.map((member) => (
        <Card key={member.id} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback>
                  {member.display_name?.substring(0, 2).toUpperCase() || 'U'}
                </AvatarFallback>
                {member.avatar && <AvatarImage src={member.avatar} alt={member.display_name || ''} />}
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {member.display_name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {member.email}
                </p>
                {member.cargo && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {member.cargo}
                  </p>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(`/team/${member.id}`)}
                title="Ver perfil e dar feedback"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
