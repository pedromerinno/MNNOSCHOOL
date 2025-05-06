import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
interface FileUploadProps {
  mediaType: "video" | "image";
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
}
export const FileUpload = ({
  mediaType,
  onFileUpload,
  isUploading
}: FileUploadProps) => {
  return <div className="space-y-2 my-[30px]">
      <Label>Upload de Arquivo</Label>
      <div className="flex items-center gap-4">
        <Input type="file" accept={mediaType === 'video' ? 'video/*' : 'image/*'} onChange={onFileUpload} className="flex-1" />
        {isUploading && <div className="text-sm text-gray-500">Enviando...</div>}
      </div>
    </div>;
};