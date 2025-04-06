
import { Button } from "@/components/ui/button";

export const HelpButton = () => {
  return (
    <div className="fixed bottom-6 right-6">
      <Button className="bg-black hover:bg-black/90 text-white rounded-full px-4 py-2 shadow-lg">
        Pedir ajuda
      </Button>
    </div>
  );
};
