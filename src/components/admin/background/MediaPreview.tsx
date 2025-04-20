
interface MediaPreviewProps {
  mediaUrl: string;
  mediaType: "video" | "image";
}

export const MediaPreview = ({ mediaUrl, mediaType }: MediaPreviewProps) => {
  if (!mediaUrl) return null;

  return (
    <div className="mt-6">
      <h4 className="text-md font-medium mb-3">Pré-visualização:</h4>
      <div className="border border-gray-200 rounded-md h-64 relative overflow-hidden">
        {mediaType === 'video' ? (
          <video 
            src={mediaUrl} 
            controls 
            className="w-full h-full object-contain" 
          />
        ) : (
          <img 
            src={mediaUrl} 
            alt="Preview" 
            className="w-full h-full object-contain" 
          />
        )}
      </div>
    </div>
  );
};
