
import React, { useState } from "react";
import { DragDropImageUpload } from "@/components/shared/DragDropImageUpload";

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
  return (
    <div className="space-y-2">
      <DragDropImageUpload 
        value={value}
        onChange={onChange}
        companyName={companyName}
      />
    </div>
  );
};

export default OnboardingLogoUploadField;
