
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Eye, EyeOff } from "lucide-react";
import { useCopyToClipboard } from "../hooks/useCopyToClipboard";
import { AccessFieldProps } from "../types/access-details";

export const AccessField = ({
  label,
  value,
  canCopy = true,
  copyMessage = "Copiado!",
  isPassword = false,
  hasExternalLink = false,
  isPasswordVisible: externalIsPasswordVisible,
  onTogglePasswordVisibility
}: AccessFieldProps) => {
  const { copyToClipboard } = useCopyToClipboard();
  const [internalIsPasswordVisible, setInternalIsPasswordVisible] = useState(false);
  
  // Use external state if provided, otherwise use internal state
  const isPasswordVisible = externalIsPasswordVisible !== undefined 
    ? externalIsPasswordVisible 
    : internalIsPasswordVisible;
  
  const handleTogglePassword = () => {
    if (onTogglePasswordVisibility) {
      onTogglePasswordVisibility();
    } else {
      setInternalIsPasswordVisible(!internalIsPasswordVisible);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {label}
        </p>
      )}
      <div className="flex items-center justify-between gap-3 p-3.5 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900/70 transition-colors">
        <div className="flex-1 min-w-0">
          {hasExternalLink ? (
            <a 
              href={value.startsWith('http') ? value : `https://${value}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 text-sm font-medium break-all"
            >
              <span className="truncate">{value}</span>
              <ExternalLink size={14} className="flex-shrink-0" />
            </a>
          ) : (
            <p className={`text-sm font-medium break-all text-gray-900 dark:text-gray-100 ${
              isPassword ? 'font-mono' : ''
            }`}>
              {isPassword 
                ? (isPasswordVisible ? value : '••••••••••••') 
                : value
              }
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {isPassword && (
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 hover:bg-gray-200 dark:hover:bg-gray-800"
              onClick={handleTogglePassword}
            >
              {isPasswordVisible ? (
                <EyeOff size={16} className="text-gray-500 dark:text-gray-400" />
              ) : (
                <Eye size={16} className="text-gray-500 dark:text-gray-400" />
              )}
            </Button>
          )}
          {canCopy && (
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 hover:bg-gray-200 dark:hover:bg-gray-800"
              onClick={() => copyToClipboard(value, copyMessage)}
            >
              <Copy size={16} className="text-gray-500 dark:text-gray-400" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
