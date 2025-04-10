
import { UserProfile } from "@/hooks/useUsers";

export const useFilterUsers = (
  allUsers: UserProfile[],
  companyUsers: string[],
  searchTerm: string
) => {
  // Filter users based on search
  const filteredUsers = allUsers.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    const displayName = (user.display_name || '').toLowerCase();
    const email = (user.email || '').toLowerCase();
    
    return displayName.includes(searchLower) || email.includes(searchLower);
  });
  
  // Separate users who are already in the company
  const availableUsers = filteredUsers.filter(user => !companyUsers.includes(user.id || ''));
  const filteredCompanyUsers = filteredUsers.filter(user => user.id && companyUsers.includes(user.id));

  return {
    filteredUsers,
    availableUsers,
    filteredCompanyUsers
  };
};
