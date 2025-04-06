
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const NotificationsWidget = () => {
  return (
    <Card className="border-0 shadow-md overflow-hidden bg-orange-50">
      <CardContent className="p-0">
        <div className="p-4 flex justify-between items-center">
          <h3 className="font-medium">Avisos</h3>
          <div className="flex space-x-2">
            <Button size="icon" variant="ghost" className="h-7 w-7">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="px-4 pb-4">
          <div className="mb-4">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium mb-2">
              Recesso
            </span>
            <h4 className="font-medium mb-1">No dia 25 teremos recesso devido ao feriado de...</h4>
            <div className="flex items-center text-gray-500 text-sm">
              <img 
                src="https://i.pravatar.cc/150?img=44" 
                alt="User avatar" 
                className="h-6 w-6 rounded-full mr-2"
              />
              <span>Jéssica</span>
              <span className="mx-2">•</span>
              <span>5 min atrás</span>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-100 p-4 text-center">
          <button className="text-sm text-gray-500 hover:text-gray-700">
            ver todos
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
