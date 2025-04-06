
import { useState } from "react";
import { Link } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProfileDialog, UserProfileFormValues } from "@/components/profile/ProfileDialog";

interface UserNavigationProps {
  avatarUrl?: string;
}

export const UserNavigation = ({ avatarUrl = "https://i.pravatar.cc/150?img=68" }: UserNavigationProps) => {
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const { user, signOut, userProfile } = useAuth();
  
  const openProfileDialog = () => {
    setIsProfileDialogOpen(true);
  };

  const handleProfileUpdate = (values: UserProfileFormValues) => {
    // Profile update is handled by the ProfileDialog component
    // via the updateUserProfile function in AuthContext
    console.log("Profile updated with values:", values);
  };

  // Use the avatar from userProfile if available, otherwise use the provided avatarUrl
  const displayAvatar = userProfile.avatar || avatarUrl;
  // Use the displayName from userProfile if available, otherwise use the email
  const displayName = userProfile.displayName || user?.email?.split('@')[0] || "Usuário";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative text-gray-500 hover:text-merinno-blue rounded-full overflow-hidden"
          >
            <img 
              src={displayAvatar} 
              alt="User avatar" 
              className="h-8 w-8 rounded-full object-cover"
            />
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">
              {displayName}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <DropdownMenuItem 
            className="cursor-pointer flex items-center gap-2"
            onClick={openProfileDialog}
          >
            <User className="h-4 w-4" />
            <span>Editar Perfil</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer">
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="cursor-pointer flex items-center gap-2"
            onClick={() => signOut()}
          >
            <LogOut className="h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileDialog 
        isOpen={isProfileDialogOpen}
        setIsOpen={setIsProfileDialogOpen}
        email={user?.email}
        onSave={handleProfileUpdate}
      />
    </>
  );
};
