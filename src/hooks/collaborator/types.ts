
import { UserProfile } from "@/hooks/useUsers";

export interface UserRole {
  userId: string;
  roleName: string;
}

export interface CollaboratorState {
  isLoading: boolean;
  companyUsers: UserProfile[];
  searchTerm: string;
  userRoles: Record<string, string>;
  reloadTrigger: number;
  error: string | null;
}

export interface CollaboratorActions {
  setSearchTerm: (term: string) => void;
  setReloadTrigger: (value: React.SetStateAction<number>) => void;
  addUserToCompany: (userId: string) => Promise<boolean | void>;
  removeUserFromCompany: (userId: string) => Promise<boolean | void>;
}

export interface CollaboratorData extends CollaboratorState, CollaboratorActions {
  loadingUsers: boolean;
  allUsers: UserProfile[];
  filteredCompanyUsers: UserProfile[];
  availableUsers: UserProfile[];
}
