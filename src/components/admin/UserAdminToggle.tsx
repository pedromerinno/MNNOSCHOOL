
import React from 'react';
import { Button } from "@/components/ui/button";
import { UserCog } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useAuth } from '@/contexts/AuthContext';
import { useUserCompanyAdmin } from '@/hooks/company/useUserCompanyAdmin';

interface UserAdminToggleProps {
  userId: string;
  isAdmin: boolean | null;
  isSuperAdmin: boolean | null;
  onToggle: (userId: string, currentStatus: boolean | null, isSuperAdmin: boolean) => Promise<void>;
}

export const UserAdminToggle: React.FC<UserAdminToggleProps> = ({ 
  userId, 
  isAdmin,
  isSuperAdmin,
  onToggle 
}) => {
  const { userProfile } = useAuth();
  const { isAdmin: isCompanyAdmin } = useUserCompanyAdmin();
  const canToggleSuperAdmin = userProfile?.super_admin;
  // is_admin foi removido de profiles - verificar em user_empresa
  const canToggleAdmin = userProfile?.super_admin || isCompanyAdmin;

  if (!canToggleAdmin) return null;

  return (
    <div className="flex items-center gap-4">
      {canToggleSuperAdmin && (
        <div className="flex items-center gap-2">
          <Switch
            checked={!!isSuperAdmin}
            onCheckedChange={() => onToggle(userId, isSuperAdmin, true)}
            disabled={!canToggleSuperAdmin}
          />
          <span className="text-sm">Super Admin</span>
        </div>
      )}
      <div className="flex items-center gap-2">
        <Switch
          checked={!!isAdmin}
          onCheckedChange={() => onToggle(userId, isAdmin, false)}
          disabled={!canToggleAdmin || !!isSuperAdmin}
        />
        <span className="text-sm">Admin</span>
      </div>
    </div>
  );
};

