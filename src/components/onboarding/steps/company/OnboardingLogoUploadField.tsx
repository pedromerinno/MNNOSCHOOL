
import React from "react";
import { Label } from "@/components/ui/label";
import DragDropImageUpload from "@/components/ui/DragDropImageUpload";

interface OnboardingLogoUploadFieldProps {
  value: string | undefined;
  onChange: (url: string) => void;
  companyName?: string;
}

const OnboardingLogoUploadField: React.FC<OnboardingLogoUploadFieldProps> = ({
  value,
  onChange,
  companyName,
}) => {
  const objectPrefix = companyName 
    ? `${companyName.replace(/\s+/g, "-").toLowerCase()}-logo`
    : "company-logo";

  return (
    <div className="space-y-2">
      <Label htmlFor="logo" className="text-sm text-gray-500 font-medium">
        Logo da empresa
      </Label>
      <DragDropImageUpload
        value={value}
        onChange={onChange}
        objectPrefix={objectPrefix}
        bucketName="company-assets"
        storagePath="logos"
        label="Arraste e solte o logo da empresa aqui ou clique para selecionar"
      />
    </div>
  );
};

export default OnboardingLogoUploadField;
