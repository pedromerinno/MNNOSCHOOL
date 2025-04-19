
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import { useCopyToClipboard } from "../hooks/useCopyToClipboard";
import { AccessFieldProps } from "../types/access-details";

export const AccessField = ({
  label,
  value,
  canCopy = true,
  copyMessage = "Copiado!",
  isPassword = false,
  hasExternalLink = false
}: AccessFieldProps) => {
  const { copyToClipboard } = useCopyToClipboard();

  return (
    <div>
      <p className="text-sm font-medium mb-1 text-gray-500 dark:text-gray-400">{label}</p>
      <div className="flex items-center justify-between gap-2">
        {hasExternalLink ? (
          <a 
            href={value.startsWith('http') ? value : `https://${value}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline flex items-center"
          >
            {value}
            <ExternalLink size={16} className="ml-1" />
          </a>
        ) : (
          <p className="text-base font-medium">
            {isPassword ? '••••••••' : value}
          </p>
        )}
        {canCopy && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => copyToClipboard(value, copyMessage)}
          >
            <Copy size={16} />
          </Button>
        )}
      </div>
    </div>
  );
};
