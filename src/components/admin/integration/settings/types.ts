
import { Company } from "@/types/company";

export interface SettingsTabsProps {
  company: Company;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleFormSubmit: (formData: any) => Promise<void>;
  isSaving: boolean;
}
