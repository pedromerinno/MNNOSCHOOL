import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { NotificationButton } from "@/components/navigation/NotificationButton";
import { ThemeToggle } from "@/components/navigation/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { LessonPlaylist } from "@/components/lessons/LessonPlaylist";
import { getAvatarUrl } from "@/utils/avatarUtils";
import { getInitials } from "@/utils/stringUtils";

interface LessonSidebarProps {
  lessons: Array<{
    id: string;
    title: string;
    type: string;
    completed?: boolean;
    duration?: string | null;
  }>;
  currentLessonId: string;
  courseId?: string;
  courseTitle?: string;
  companyColor?: string;
  isAdmin?: boolean;
  onBackToCourse?: () => void;
  onManageLessons?: () => void;
}

export const LessonSidebar: React.FC<LessonSidebarProps> = ({
  lessons,
  currentLessonId,
  courseId,
  courseTitle,
  companyColor = "#1EAEDB",
  isAdmin = false,
  onBackToCourse,
  onManageLessons
}) => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const getFirstName = (name: string | null | undefined): string => {
    if (!name) return 'Usuário';
    return name.split(' ')[0];
  };

  const firstName = useMemo(() => getFirstName(userProfile?.display_name), [userProfile?.display_name]);
  const userInitials = useMemo(() => {
    return userProfile?.display_name
      ? userProfile.display_name
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : 'U';
  }, [userProfile?.display_name]);

  const userAvatar = useMemo(() => 
    getAvatarUrl(userProfile?.avatar, "/lovable-uploads/54cf67d5-105d-4bf2-8396-70dcf1507021.png"),
    [userProfile?.avatar]
  );

  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl border border-gray-200 dark:border-[#262626] p-5 flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* User Info and Notifications Header */}
      <div className="flex-shrink-0 pb-4 border-b border-gray-200 dark:border-[#262626]">
        <div className="flex items-center justify-between">
          {/* User Info */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-gray-200 dark:border-[#262626]">
              <AvatarImage 
                src={userAvatar}
                alt={firstName}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/lovable-uploads/54cf67d5-105d-4bf2-8396-70dcf1507021.png";
                }}
              />
              <AvatarFallback 
                className="text-white text-sm font-semibold"
                style={{
                  backgroundColor: `${companyColor}15`,
                  color: companyColor,
                }}
              >
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {firstName}
              </p>
              {userProfile?.email && (
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[140px]">
                  {userProfile.email}
                </p>
              )}
            </div>
          </div>
          
          {/* Notifications and Theme Toggle */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NotificationButton />
          </div>
        </div>
      </div>

      {/* Playlist de Aulas - com scroll interno */}
      <div className="flex-1 min-h-0 -mx-5 px-5 mt-5">
        <div className="max-h-[calc(100vh-420px)] overflow-y-auto pr-2 -mr-2">
          <LessonPlaylist
            lessons={lessons}
            currentLessonId={currentLessonId}
            onLessonSelect={() => {}}
            loading={false}
            companyColor={companyColor}
            courseId={courseId}
          />
        </div>
      </div>
    </div>
  );
};
