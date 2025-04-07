
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const MakeAdminButton = () => {
  const { userProfile } = useAuth();
  
  // Completely remove the component render
  return null;
};
