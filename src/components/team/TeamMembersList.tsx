
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {members.map((member) => (
        <Card 
          key={member.id} 
          className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <Avatar className="h-10 w-10 border">
                  <AvatarImage src={member.avatar || undefined} alt={member.display_name || ''} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {member.display_name?.substring(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {member.display_name || 'Usuário'}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {member.email || ''}
                  </p>
                  {member.cargo && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {member.cargo}
                    </p>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(`/team/${member.id}`)}
                  className="shrink-0"
                  title="Ver perfil e enviar feedback"
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
