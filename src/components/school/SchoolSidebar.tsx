
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Clock, Search } from "lucide-react";

interface SchoolSidebarProps {
  statistics: {
    completedVideos: number;
    hoursWatched: number;
  };
  suggestedTopics: {
    id: string;
    name: string;
  }[];
}

export const SchoolSidebar: React.FC<SchoolSidebarProps> = ({ statistics, suggestedTopics }) => {
  return (
    <div className="w-72 border-l border-gray-100 pl-6">
      {/* Stats */}
      <div className="mb-8">
        <div className="bg-amber-50 rounded-lg p-4 mb-4">
          <h3 className="text-sm font-medium mb-2">Vídeos completos</h3>
          <p className="text-4xl font-bold">{statistics.completedVideos.toString().padStart(2, '0')}</p>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Horas assistidas</h3>
            <div className="flex items-center text-xs">
              <span>Ano</span>
              <ChevronRight className="h-3 w-3 ml-1" />
            </div>
          </div>
          <p className="text-lg font-medium mb-2">{statistics.hoursWatched} horas</p>
          
          <div className="flex items-center text-xs bg-blue-100 text-blue-800 rounded px-2 py-1 w-fit">
            <Clock className="h-3 w-3 mr-1" />
            <span>Bom trabalho</span>
          </div>
          
          <div className="mt-4 h-24 flex items-end justify-between">
            {[40, 60, 30, 80, 50, 75, 45, 65, 55, 35, 70, 25].map((height, i) => (
              <div key={i} className="w-1.5 bg-blue-400 rounded-t" style={{ height: `${height}%` }}></div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Jan</span>
            <span>Fev</span>
            <span>Mar</span>
            <span>Abr</span>
            <span>Mai</span>
            <span>Jun</span>
            <span>Jul</span>
            <span>Ago</span>
            <span>Set</span>
            <span>Out</span>
            <span>Nov</span>
            <span>Dez</span>
          </div>
        </div>
      </div>
      
      {/* Suggested Topics */}
      <div>
        <h3 className="text-sm font-medium mb-4">Temas Sugeridos</h3>
        <div className="space-y-2">
          {suggestedTopics.map((topic) => (
            <Card key={topic.id} className="overflow-hidden border shadow-sm">
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <Search className="h-4 w-4 text-green-600" />
                  </div>
                  <span>{topic.name}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
