
import React from 'react';
import { Loader2 } from "lucide-react";

export const LoadingState: React.FC = React.memo(() => {
  return (
    <div className="flex justify-center items-center h-64 animate-fade-in">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
});
