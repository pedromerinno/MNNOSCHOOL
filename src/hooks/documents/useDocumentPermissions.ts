
import { UserDocument } from "@/types/document";

export const useDocumentPermissions = (currentUserId: string | null) => {
  const canDeleteDocument = (document: UserDocument): boolean => {
    return document.uploaded_by === currentUserId;
  };

  return { canDeleteDocument };
};
