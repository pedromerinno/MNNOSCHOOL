
import { UserProfile } from "@/hooks/useUsers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileCardProps {
  member: UserProfile;
}

export const ProfileCard = ({ member }: ProfileCardProps) => {
  return (
    <Card className="border-0 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <CardContent className="p-6 space-y-6">
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-24 w-24 border-2 border-primary/10">
            <AvatarImage src={member?.avatar || undefined} alt={member?.display_name || ''} />
            <AvatarFallback className="bg-primary/10 text-primary text-xl">
              {member?.display_name?.substring(0, 2).toUpperCase() || <UserRound className="h-8 w-8" />}
            </AvatarFallback>
          </Avatar>
          
          <div className="mt-4 space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              {member?.display_name}
            </h2>
            
            {member?.cargo_id && (
              <p className="text-muted-foreground">
                Cargo ID: {member.cargo_id}
              </p>
            )}
            
            {member?.is_admin && (
              <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                Administrator
              </span>
            )}
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => window.location.href = `mailto:${member?.email}`}
        >
          <Mail className="h-4 w-4" />
          Enviar email
        </Button>
      </CardContent>
    </Card>
  );
};
