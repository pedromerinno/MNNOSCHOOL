
import { User, Session } from "@supabase/supabase-js";

export type UserProfile = {
  displayName: string | null;
  avatar: string | null;
  isAdmin?: boolean;
  cargo?: string | null;
};

export type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userProfile: UserProfile;
  updateUserProfile: (profile: UserProfile) => Promise<void>;
  makeAdmin: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<{
    error: Error | null;
    data: any | null;
  }>;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data: any | null;
  }>;
  signOut: () => Promise<void>;
};
