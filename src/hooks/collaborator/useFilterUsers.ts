
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
    // Ensure we have valid data to work with
    if (!Array.isArray(allUsers) || !Array.isArray(companyUserIds)) {
      console.log("Invalid data in useFilterUsers:", { allUsers, companyUserIds });
      setFilteredCompanyUsers([]);
      setAvailableUsers([]);
      return;
    }

    console.log(`Filtering users: All users=${allUsers.length}, Company user IDs=${companyUserIds.length}`);
    
    // First, filter all users that are in the company
    const companyUsers = allUsers.filter(user => 
      user && user.id && companyUserIds.includes(user.id)
    );
    
    // Then, apply search term filter
    const filteredUsers = searchTerm ? companyUsers.filter(user => {
      const searchTermLower = searchTerm.toLowerCase();
      const displayName = (user.display_name || '').toLowerCase();
      const email = (user.email || '').toLowerCase();
      return displayName.includes(searchTermLower) || email.includes(searchTermLower);
    }) : companyUsers;
    
    // Filter users not already in the company
    const notInCompany = allUsers.filter(user => 
      user && user.id && !companyUserIds.includes(user.id)
    );
    
    // Apply search term filter to available users
    const filteredAvailable = searchTerm ? notInCompany.filter(user => {
      const searchTermLower = searchTerm.toLowerCase();
      const displayName = (user.display_name || '').toLowerCase();
      const email = (user.email || '').toLowerCase();
      return displayName.includes(searchTermLower) || email.includes(searchTermLower);
    }) : notInCompany;
    
    console.log(`Filtered: Company users=${filteredUsers.length}, Available users=${filteredAvailable.length}`);
    
    setFilteredCompanyUsers(filteredUsers);
    setAvailableUsers(filteredAvailable);
  }, [allUsers, companyUserIds, searchTerm]);

  return {
    filteredCompanyUsers,
    availableUsers
  };
};
