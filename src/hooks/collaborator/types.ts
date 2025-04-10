
import { UserProfile } from "@/hooks/useUsers";
import { Company } from "@/types/company";

export interface UserRole {
  userId: string;
  roleName: string;
}

export interface CollaboratorState {
  isLoading: boolean;
  companyUsers: string[];
  searchTerm: string;
  userRoles: Record<string, string>;
  reloadTrigger: number;
}

export interface CollaboratorActions {
  setSearchTerm: (term: string) => void;
  setReloadTrigger: (value: React.SetStateAction<number>) => void;
  addUserToCompany: (userId: string) => Promise<void>;
  removeUserFromCompany: (userId: string) => Promise<void>;
}

export interface CollaboratorData extends CollaboratorState, CollaboratorActions {
  loadingUsers: boolean;
  allUsers: UserProfile[];
  filteredCompanyUsers: UserProfile[];
  availableUsers: UserProfile[];
}
