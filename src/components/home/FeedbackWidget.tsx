
import { Card, CardContent } from "@/components/ui/card";

export const FeedbackWidget = () => {
  return (
    <Card className="border-0 shadow-md overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 flex justify-between items-center">
          <h3 className="font-medium">Feedbacks</h3>
          <span className="text-2xl font-medium">4</span>
        </div>
        
        <div className="px-4 pb-4">
          <div className="bg-green-50 rounded-lg p-4 mb-4">
            <p className="mb-2">
              <span className="font-medium">Parabéns Felipe,</span><br />
              pelo projeto da Syngenta.
            </p>
            <div className="flex items-center justify-between">
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
              <button className="text-xs text-blue-600 hover:text-blue-800">
                retribuir
              </button>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <p className="mb-2">
              <span className="font-medium">Parabéns Felipe,</span><br />
              pelo projeto da Syngenta.
            </p>
            <div className="flex items-center justify-between">
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
              <button className="text-xs text-blue-600 hover:text-blue-800">
                retribuir
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
