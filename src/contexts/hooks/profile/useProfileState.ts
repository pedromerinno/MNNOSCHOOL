
import { useState } from "react";
import { UserProfile } from "@/contexts/types/auth-types";
import { UseProfileState } from "./types";

export const useProfileState = (): UseProfileState => {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    displayName: null,
    avatar: null,
    isAdmin: false,
    cargo: null
  });

  return {
    userProfile,
    setUserProfile
  };
};
