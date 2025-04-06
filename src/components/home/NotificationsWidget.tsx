
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const NotificationsWidget = () => {
  return (
    <Card className="border-0 shadow-md overflow-hidden bg-[#f8f7f4] rounded-[30px]">
      <CardContent className="p-0">
        <div className="p-8 flex justify-between items-center">
          <h3 className="text-2xl font-medium text-black">Avisos</h3>
          <div className="flex space-x-4">
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-12 w-12 rounded-full border border-gray-300 hover:bg-amber-50"
            >
              <ChevronLeft className="h-5 w-5 text-gray-500" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-12 w-12 rounded-full border border-gray-300 hover:bg-amber-50"
            >
              <ChevronRight className="h-5 w-5 text-gray-500" />
            </Button>
          </div>
        </div>
        
        <div className="px-8 pb-8">
          <div className="mb-8">
            <span className="inline-block px-6 py-3 rounded-full bg-amber-100 text-black text-base font-medium mb-6">
              Recesso
            </span>
            <h4 className="text-3xl font-medium mb-6">No dia 25 teremos recesso devido ao feriado de...</h4>
            <div className="flex items-center text-gray-500">
              <img 
                src="https://i.pravatar.cc/150?img=44" 
                alt="User avatar" 
                className="h-10 w-10 rounded-full mr-4"
              />
              <span className="text-xl font-medium text-black mr-6">Jéssica</span>
              <span className="text-gray-500 text-lg">5 min atrás</span>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-100 py-6 text-center">
          <button className="text-lg text-gray-500 hover:text-gray-700">
            ver todos
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
