
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Image, Upload } from "lucide-react";

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
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem.");
      return;
    }
    setIsUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${(companyName || "company").replace(/\s+/g, "-").toLowerCase()}-logo-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      // Upload to supabase storage
      const { error } = await supabase.storage
        .from("company-assets")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("company-assets")
        .getPublicUrl(filePath);

      onChange(publicUrl);
      toast.success("Logo enviado com sucesso!");
    } catch (error: any) {
      toast.error(`Erro ao enviar logo: ${error.message}`);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        <Input
          type="text"
          value={value || ""}
          onChange={e => onChange(e.target.value)}
          placeholder="https://exemplo.com/logo.png"
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          disabled={isUploading}
          onClick={() => document.getElementById("onboarding-logo-upload")?.click()}
        >
          <Upload className="w-4 h-4" />
          {isUploading ? "Enviando..." : "Upload"}
        </Button>
        <input
          id="onboarding-logo-upload"
          type="file"
          accept="image/*"
          hidden
          onChange={handleFileUpload}
          disabled={isUploading}
        />
      </div>
      {value && (
        <div className="border rounded-md p-2 flex justify-center bg-gray-50">
          <img
            src={value}
            alt="Logo preview"
            className="h-14 object-contain rounded bg-white max-w-[180px]"
            onError={e => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
          />
        </div>
      )}
    </div>
  );
};

export default OnboardingLogoUploadField;

