import React, { useState } from 'react';
import { EmptyState } from "@/components/ui/empty-state";
import { Video } from "lucide-react";
import { AddVideoToPlaylistDialog } from "./AddVideoToPlaylistDialog";

interface NoVideosAvailableProps {
  companyId: string;
  companyColor: string;
  onVideoAdded?: () => void;
}

export const NoVideosAvailable: React.FC<NoVideosAvailableProps> = ({
  companyId,
  companyColor,
  onVideoAdded
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddVideos = () => {
    setIsDialogOpen(true);
  };

  const handleVideoAdded = () => {
    onVideoAdded?.();
  };

  return (
    <>
      <EmptyState
        title="Sem vídeos disponíveis"
        description="Não há vídeos de integração disponíveis para esta empresa."
        icons={[Video]}
        action={{
          label: "Adicionar vídeos",
          onClick: handleAddVideos
        }}
      />
      <AddVideoToPlaylistDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        companyId={companyId}
        companyColor={companyColor}
        onVideoAdded={handleVideoAdded}
      />
    </>
  );
};
