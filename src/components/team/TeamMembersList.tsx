
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { UserProfile } from "@/hooks/useUsers";

interface TeamMembersListProps {
  members: UserProfile[];
}

export const TeamMembersList = ({ members }: TeamMembersListProps) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {members.map((member) => (
        <Card 
          key={member.id} 
          className="group transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-0 bg-white cursor-pointer"
          onClick={() => navigate(`/team/${member.id}`)}
        >
          <CardContent className="p-6">
            <div className="flex flex-col items-start gap-4">
              <div className="flex items-start justify-between w-full">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-primary/10">
                    <AvatarImage src={member.avatar || undefined} alt={member.display_name || ''} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {member.display_name?.substring(0, 2).toUpperCase() || <UserRound className="h-6 w-6" />}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h3 className="font-medium text-lg">
                      {member.display_name || 'Usuário'}
                    </h3>
                    {member.cargo && (
                      <p className="text-sm text-muted-foreground">
                        {member.cargo}
                      </p>
                    )}
                  </div>
                </div>

                {member.is_admin && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    Admin
                  </span>
                )}
              </div>

              <Button
                variant="default"
                size="sm"
                className="w-full gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/team/${member.id}`);
                }}
              >
                <MessageSquare className="h-4 w-4" />
                Feedback
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
