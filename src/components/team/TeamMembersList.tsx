
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { UserProfile } from "@/hooks/useUsers";
import { Skeleton } from "@/components/ui/skeleton";

interface TeamMembersListProps {
  members: UserProfile[];
  isLoading?: boolean;
}

export const TeamMembersList = ({ members, isLoading = false }: TeamMembersListProps) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6).fill(0).map((_, i) => (
          <Card key={`skeleton-${i}`} className="border-0 bg-white">
            <CardContent className="p-6">
              <div className="flex flex-col items-start gap-4">
                <div className="flex items-start justify-between w-full">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

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
                variant="outline"
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
