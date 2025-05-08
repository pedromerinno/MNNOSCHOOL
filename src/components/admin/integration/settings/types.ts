
import { Company } from "@/types/company";

export interface SettingsTabsProps {
  company: Company;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleFormSubmit: (formData: any) => Promise<void>;
  isSaving: boolean;
}

export interface SettingsTabContentProps {
  value: string;
  company: Company | null;
  onSubmit?: (formData: any) => Promise<void>;
  isSaving?: boolean;
}

export interface SettingsTabProps {
  company: Company | null;
  onSubmit?: (formData: any) => Promise<void>;
  isSaving?: boolean;
}
