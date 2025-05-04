
// Maximum file size for uploads (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024; 

// Allowed MIME types for document uploads
export const ALLOWED_FILE_TYPES = [
  'application/pdf', 
  'application/msword', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png'
];

// Bucket name for document storage
export const DOCUMENTS_BUCKET = 'documents';
