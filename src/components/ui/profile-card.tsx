import React from 'react';
import { TeamMember } from "@/hooks/team/useTeamMembersOptimized";
import { UserProfile } from "@/types/user";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileCardProps {
  member: TeamMember | UserProfile;
  companyColor?: string;
  onAddMember?: (member: TeamMember | UserProfile) => void;
  className?: string;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  member,
  companyColor = "#1EAEDB",
  onAddMember,
  className
}) => {
  // Format time ago for social media style display
  const formatTimeAgo = (dateString?: string | null) => {
    if (!dateString) return "";
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: ptBR 
      });
    } catch (error) {
      return "";
    }
  };

  // Get display name or fallback
  const displayName = member.display_name || 'Usuário';
  
  // Get username from email (before @) or use display name
  const username = member.email 
    ? `@${member.email.split('@')[0]}` 
    : `@${displayName.toLowerCase().replace(/\s+/g, '')}`;

  // Use avatar or a placeholder image
  const avatarUrl = member.avatar || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces&auto=format&q=80`;
  // Use a different placeholder for the main image to avoid repetition
  const profileImageUrl = member.avatar || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&h=800&fit=crop&crop=faces&auto=format&q=80`;

  const timeAgo = formatTimeAgo(member.created_at);
  
  // Get initials for fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className={cn(
      "bg-white dark:bg-zinc-900 rounded-xl shadow-md dark:shadow-lg dark:shadow-black/50 overflow-hidden",
      "transition-transform duration-300 ease-out hover:scale-[1.01] hover:shadow-lg",
      className
    )}>
      <div className="relative overflow-hidden group">
        {member.avatar ? (
          <img 
            src={profileImageUrl}
            alt={displayName} 
            className="w-full h-32 object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
            onError={(e) => {
              // Fallback to gradient if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                const gradientDiv = document.createElement('div');
                gradientDiv.className = 'w-full h-32 flex items-center justify-center';
                gradientDiv.style.background = `linear-gradient(135deg, ${companyColor} 0%, ${companyColor}dd 100%)`;
                const initialsDiv = document.createElement('div');
                initialsDiv.className = 'text-white text-2xl font-bold';
                initialsDiv.textContent = getInitials(displayName);
                gradientDiv.appendChild(initialsDiv);
                parent.insertBefore(gradientDiv, target);
              }
            }}
          />
        ) : (
          <div 
            className="w-full h-32 flex items-center justify-center transition-transform duration-300 ease-out group-hover:scale-[1.02]"
            style={{ background: `linear-gradient(135deg, ${companyColor} 0%, ${companyColor}dd 100%)` }}
          >
            <div className="text-white text-2xl font-bold drop-shadow-lg">
              {getInitials(displayName)}
            </div>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/30 dark:from-black/60 to-transparent pointer-events-none"></div>
        <div className="absolute top-3 left-3">
          <h2 className="text-base font-semibold text-white drop-shadow-lg">
            {displayName}
          </h2>
        </div>
      </div>
      
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-zinc-700 transition-transform duration-300 ease-out hover:scale-110">
            {member.avatar ? (
              <img 
                src={avatarUrl}
                alt={displayName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700"><svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></div>`;
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                <UserRound className="w-3 h-3 text-gray-400" />
              </div>
            )}
          </div>
          <div className="transition-transform duration-300 ease-out hover:translate-x-0.5">
            <div className="text-xs text-gray-700 dark:text-zinc-200 font-medium">{username}</div>
            <div className="text-xs text-gray-500 dark:text-zinc-500">
              {timeAgo || 'Membro recente'}
            </div>
          </div>
        </div>
        {onAddMember && (
          <button 
            onClick={() => onAddMember(member)}
            className="bg-gray-900 dark:bg-zinc-800 text-white dark:text-zinc-100 rounded-lg px-3 py-1.5 text-xs font-medium
                     transition-all duration-300 ease-out transform hover:scale-105 
                     hover:bg-gray-800 dark:hover:bg-zinc-700
                     active:scale-95 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/50"
          >
            + Add member
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;

