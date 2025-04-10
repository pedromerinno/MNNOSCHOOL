
import { useMemo } from 'react';
import { UserProfile } from '@/hooks/useUsers';

export const useFilterUsers = (
  allUsers: UserProfile[],
  companyUsers: UserProfile[],
  searchTerm: string
) => {
  const filteredCompanyUsers = useMemo(() => {
    if (!searchTerm) return companyUsers;
    
    const searchTermLower = searchTerm.toLowerCase();
    
    return companyUsers.filter(user => {
      const displayName = user.display_name?.toLowerCase() || '';
      const email = user.email?.toLowerCase() || '';
      
      return displayName.includes(searchTermLower) || email.includes(searchTermLower);
    });
  }, [companyUsers, searchTerm]);
  
  const availableUsers = useMemo(() => {
    console.log('Filtering users: All users=' + allUsers.length + ', Company users=' + companyUsers.length);
    
    // Filter out users who are already in the company
    const result = allUsers.filter(user => 
      !companyUsers.some(companyUser => companyUser.id === user.id)
    );
    
    const filteredResult = searchTerm
      ? result.filter(user => {
          const searchTermLower = searchTerm.toLowerCase();
          const displayName = user.display_name?.toLowerCase() || '';
          const email = user.email?.toLowerCase() || '';
          
          return displayName.includes(searchTermLower) || email.includes(searchTermLower);
        })
      : result;
    
    console.log('Filtered: Available users=' + filteredResult.length);
    return filteredResult;
  }, [allUsers, companyUsers, searchTerm]);
  
  return { filteredCompanyUsers, availableUsers };
};
