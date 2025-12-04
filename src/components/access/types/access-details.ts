
import { AccessItem } from "../types";

export interface AccessDetailsProps {
  access: AccessItem | null;
  isOpen: boolean;
  onClose: () => void;
  companyColor?: string;
  onAccessUpdated?: () => void;
}

export interface AccessFieldProps {
  label: string;
  value: string;
  canCopy?: boolean;
  copyMessage?: string;
  isPassword?: boolean;
  hasExternalLink?: boolean;
  isPasswordVisible?: boolean;
  onTogglePasswordVisibility?: () => void;
}
