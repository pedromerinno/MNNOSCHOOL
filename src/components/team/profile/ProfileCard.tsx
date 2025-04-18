
import { UserProfile } from "@/hooks/useUsers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

interface ProfileCardProps {
  member: UserProfile;
}

export const ProfileCard = ({ member }: ProfileCardProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarFallback>
              {member?.display_name?.substring(0, 2).toUpperCase() || 'U'}
            </AvatarFallback>
            {member?.avatar && <AvatarImage src={member.avatar} alt={member.display_name || ''} />}
          </Avatar>
          
          <h2 className="text-xl font-bold text-center">{member?.display_name}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-center">{member?.email}</p>
          
          {member?.cargo && (
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-center">
              {member.cargo}
            </p>
          )}
          
          {member?.is_admin && (
            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs mt-2">
              Administrator
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
