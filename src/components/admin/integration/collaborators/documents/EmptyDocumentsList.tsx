
import { FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyDocumentsListProps {
  onUploadClick: () => void;
}

export const EmptyDocumentsList: React.FC<EmptyDocumentsListProps> = ({ onUploadClick }) => {
  return (
    <div className="text-center py-8">
      <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
      <h3 className="text-lg font-medium mb-2">Nenhum documento</h3>
      <p className="text-gray-500 mb-4">
        Este colaborador não possui documentos cadastrados.
      </p>
      <Button onClick={onUploadClick}>
        <Upload className="mr-2 h-4 w-4" />
        Adicionar Documento
      </Button>
    </div>
  );
};
