
import { Card, CardContent } from "@/components/ui/card";

export const FeedbackWidget = () => {
  return (
    <Card className="border-0 shadow-none overflow-hidden rounded-[30px] bg-[#FAFFF7]">
      <CardContent className="p-0">
        <div className="p-8 flex justify-between items-center">
          <h3 className="text-2xl font-medium">Feedbacks</h3>
          <span className="text-2xl font-medium">4</span>
        </div>
        
        <div className="px-8 pb-8">
          <div className="bg-green-50 rounded-lg p-6 mb-6">
            <p className="text-base mb-6">
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
                <span className="text-base font-medium text-black mr-6">Jéssica</span>
                <span className="text-sm text-gray-500">5 min atrás</span>
              </div>
              <button className="self-start px-8 py-3 rounded-full bg-white/80 text-black hover:bg-white transition-colors">
                retribuir
              </button>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-6">
            <p className="text-base mb-6">
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
                <span className="text-base font-medium text-black mr-6">Jéssica</span>
                <span className="text-sm text-gray-500">5 min atrás</span>
              </div>
              <button className="self-start px-8 py-3 rounded-full bg-white/80 text-black hover:bg-white transition-colors">
                retribuir
              </button>
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
