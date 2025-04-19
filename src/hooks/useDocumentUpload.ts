
import { useDocumentUpload as useDocumentUploadNew, MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from './documents/useDocumentUpload';

// Export the constants so they can be imported from this file
export { MAX_FILE_SIZE, ALLOWED_FILE_TYPES };

// This function is kept for backward compatibility
export const useDocumentUpload = (params?: { userId?: string, companyId?: string, onUploadComplete?: () => void }) => {
  return useDocumentUploadNew(params);
};
