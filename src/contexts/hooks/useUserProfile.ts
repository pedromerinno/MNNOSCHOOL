
import { useProfileState } from "./profile/useProfileState";
import { useProfileActions } from "./profile/useProfileActions";
import { useAdminActions } from "./profile/useAdminActions";
import { UseProfileHook } from "./profile/types";

export const useUserProfile = (): UseProfileHook => {
  const profileState = useProfileState();
  const profileActions = useProfileActions(profileState);
  const adminActions = useAdminActions(profileState);

  return {
    ...profileState,
    ...profileActions,
    ...adminActions
  };
};
