
import { useState } from 'react';
import { UserProfile } from '@/hooks/useUsers';

export const useDialogState = () => {
  const [showAddUsersDialog, setShowAddUsersDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showDocumentsDialog, setShowDocumentsDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<string>("users");

  return {
    showAddUsersDialog,
    setShowAddUsersDialog,
    showRoleDialog,
    setShowRoleDialog,
    showDocumentsDialog,
    setShowDocumentsDialog,
    showUploadDialog,
    setShowUploadDialog,
    selectedUser,
    setSelectedUser,
    activeTab,
    setActiveTab,
  };
};
