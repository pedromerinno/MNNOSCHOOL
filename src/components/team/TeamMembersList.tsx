
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { UserProfile } from "@/hooks/useUsers";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";

interface TeamMembersListProps {
  members: UserProfile[];
}

export const TeamMembersList = ({ members }: TeamMembersListProps) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {members.map((member) => (
        <HoverCard key={member.id}>
          <HoverCardTrigger asChild>
            <Card 
              className="transition-all duration-300 hover:bg-accent/5 border-transparent hover:border-accent/20"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 ring-2 ring-background">
                    <AvatarImage src={member.avatar || undefined} alt={member.display_name || ''} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {member.display_name?.substring(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-base">
                      {member.display_name || 'Usuário'}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {member.cargo || 'Membro da equipe'}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/team/${member.id}`)}
                    className="ml-auto shrink-0 text-muted-foreground hover:text-foreground"
                    title="Ver perfil e enviar feedback"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </HoverCardTrigger>
          <HoverCardContent className="w-80 p-4">
            <div className="flex justify-between space-x-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={member.avatar || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {member.display_name?.substring(0, 2).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">{member.display_name}</h4>
                <p className="text-sm text-muted-foreground">
                  {member.email}
                </p>
                {member.cargo && (
                  <div className="flex items-center pt-2">
                    <span className="rounded-md bg-primary/10 px-2 py-1 text-xs text-primary">
                      {member.cargo}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      ))}
    </div>
  );
};
