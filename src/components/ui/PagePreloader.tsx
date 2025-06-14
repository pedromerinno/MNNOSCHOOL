
import { Loader2 } from "lucide-react";

export const PagePreloader = () => {
  return (
    <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#191919] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </div>
  );
};
