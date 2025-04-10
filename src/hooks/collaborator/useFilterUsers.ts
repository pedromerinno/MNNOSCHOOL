
import { useEffect, useState } from 'react';
import { UserProfile } from "@/hooks/useUsers";

export const useFilterUsers = (
  allUsers: UserProfile[],
  companyUserIds: string[],
  searchTerm: string
) => {
  const [filteredCompanyUsers, setFilteredCompanyUsers] = useState<UserProfile[]>([]);
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([]);

  // Filter company users based on company user IDs and search term
  useEffect(() => {
    // First, filter all users that are in the company
    const companyUsers = allUsers.filter(user => 
      user.id && companyUserIds.includes(user.id)
    );
    
    // Then, apply search term filter
    const filteredUsers = companyUsers.filter(user => {
      const searchTermLower = searchTerm.toLowerCase();
      const displayName = (user.display_name || '').toLowerCase();
      const email = (user.email || '').toLowerCase();
      return displayName.includes(searchTermLower) || email.includes(searchTermLower);
    });
    
    console.log(`Filtered company users: ${filteredUsers.length} out of ${companyUsers.length} total company users`);
    setFilteredCompanyUsers(filteredUsers);
  }, [allUsers, companyUserIds, searchTerm]);

  // Filter available users (users not in the company)
  useEffect(() => {
    // Filter users not already in the company
    const notInCompany = allUsers.filter(user => 
      user.id && !companyUserIds.includes(user.id)
    );
    
    // Apply search term filter to available users
    const filteredAvailable = notInCompany.filter(user => {
      if (!searchTerm) return true;
      
      const searchTermLower = searchTerm.toLowerCase();
      const displayName = (user.display_name || '').toLowerCase();
      const email = (user.email || '').toLowerCase();
      return displayName.includes(searchTermLower) || email.includes(searchTermLower);
    });
    
    console.log(`Available users: ${filteredAvailable.length} out of ${allUsers.length} total users`);
    setAvailableUsers(filteredAvailable);
  }, [allUsers, companyUserIds, searchTerm]);

  return {
    filteredCompanyUsers,
    availableUsers
  };
};
