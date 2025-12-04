
import React from "react";
import { Loader2 } from "lucide-react";

export const IndexLoadingState = React.memo(() => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 animate-fade-in">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
));
