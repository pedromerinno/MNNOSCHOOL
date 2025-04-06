
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const NotificationsWidget = () => {
  return (
    <Card className="border-0 shadow-none overflow-hidden bg-[#F1EDE4] dark:bg-[#342B1A] rounded-[30px]">
      <CardContent className="p-0 flex flex-col h-full">
        <div className="p-8 flex justify-between items-center">
          <h3 className="text-xl font-medium text-black dark:text-white">Avisos</h3>
          <div className="flex space-x-4">
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-12 w-12 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
            >
              <ChevronLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-12 w-12 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
            >
              <ChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </Button>
          </div>
        </div>
        
        <div className="px-12 pb-8 flex-1">
          <div className="mb-8">
            <span className="inline-block px-8 py-3 rounded-full bg-amber-100 dark:bg-amber-900/50 text-black dark:text-amber-100 text-base font-medium mb-6">
              Recesso
            </span>
            <h4 className="text-xl font-medium mb-6 dark:text-white">No dia 25 teremos recesso devido ao feriado de...</h4>
            <div className="flex items-center text-gray-500">
              <img 
                src="https://i.pravatar.cc/150?img=44" 
                alt="User avatar" 
                className="h-8 w-8 rounded-full mr-4"
              />
              <span className="text-base font-medium text-black dark:text-white mr-6">Jéssica</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">5 min atrás</span>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-100 dark:border-gray-800 py-6 text-center mb-6">
          <button className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
            ver todos
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
