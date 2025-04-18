
import { UserProfile } from "@/contexts/types/auth-types";

export interface UseProfileState {
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
}

export interface UseProfileActions {
  fetchUserProfile: (userId: string) => Promise<void>;
  createUserProfile: (userId: string, user?: User) => Promise<void>;
  updateUserProfile: (profile: UserProfile) => Promise<void>;
}

export interface UseAdminActions {
  makeAdmin: () => Promise<void>;
}

export type UseProfileHook = UseProfileState & UseProfileActions & UseAdminActions;
