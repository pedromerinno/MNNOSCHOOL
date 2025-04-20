
import { UserProfile } from "@/types/user";

export const isSuperAdmin = (userProfile: UserProfile | null): boolean => {
  return !!userProfile?.super_admin;
};

export const isAdmin = (userProfile: UserProfile | null): boolean => {
  return !!userProfile?.is_admin || !!userProfile?.super_admin;
};
