
import { UserProfile } from "@/hooks/useUsers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

interface ProfileCardProps {
  member: UserProfile;
}

export const ProfileCard = ({ member }: ProfileCardProps) => {
  return (
    <Card className="overflow-hidden border-accent/20">
      <CardContent className="p-6">
        <div className="flex flex-col items-center">
          <Avatar className="h-24 w-24 mb-6 ring-4 ring-background">
            <AvatarImage src={member.avatar || undefined} alt={member.display_name || ''} />
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-medium">
              {member?.display_name?.substring(0, 2).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <h2 className="text-2xl font-semibold text-center mb-1">
            {member?.display_name}
          </h2>
          <p className="text-muted-foreground text-center mb-4">
            {member?.email}
          </p>
          
          {member?.cargo && (
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm">
                {member.cargo}
              </span>
            </div>
          )}
          
          {member?.is_admin && (
            <span className="bg-accent/10 text-accent px-3 py-1.5 rounded-full text-sm mt-2">
              Administrador
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
