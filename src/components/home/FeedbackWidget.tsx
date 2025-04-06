
import { Card, CardContent } from "@/components/ui/card";

export const FeedbackWidget = () => {
  return (
    <Card className="border-0 shadow-none overflow-hidden rounded-[30px] bg-[#FAFFF7] dark:bg-[#1A2E1A]">
      <CardContent className="p-0 flex flex-col h-full">
        <div className="p-8 flex justify-between items-center">
          <h3 className="text-xl font-medium dark:text-white">Feedbacks</h3>
          <span className="text-xl font-medium dark:text-white">1</span>
        </div>
        
        <div className="px-8 pb-8 flex-1">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
            <p className="text-base mb-6 dark:text-gray-200">
              <span>Parabéns Felipe,</span><br />
              pelo projeto da Syngenta.
            </p>
            <div className="flex flex-col">
              <div className="flex items-center mb-4">
                <img 
                  src="https://i.pravatar.cc/150?img=44" 
                  alt="User avatar" 
                  className="h-10 w-10 rounded-full mr-4"
                />
                <span className="text-base font-medium text-black dark:text-white mr-6">Jéssica</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">5 min atrás</span>
              </div>
              <button className="self-start px-8 py-3 rounded-full bg-white/80 dark:bg-white/10 text-black dark:text-white hover:bg-white dark:hover:bg-white/20 transition-colors">
                retribuir
              </button>
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
