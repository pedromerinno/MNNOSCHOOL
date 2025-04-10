
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CourseSidebarProps {
  stats: {
    favorites: number;
    inProgress: number;
    completed: number;
    videosCompleted: number;
  };
  hoursWatched: number;
}

export const CourseSidebar: React.FC<CourseSidebarProps> = ({
  stats,
  hoursWatched
}) => {
  return (
    <div className="space-y-6">
      {/* Video stats card */}
      <Card className="overflow-hidden shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Aulas completas</h3>
            <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </Button>
          </div>
          <div className="text-center pb-4">
            <span className="text-7xl font-bold block">
              {stats.videosCompleted.toString().padStart(2, '0')}
            </span>
          </div>
        </CardContent>
      </Card>
      
      {/* Hours watched card */}
      <Card className="overflow-hidden shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium">Horas assistidas</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Ano</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-bold">{hoursWatched} horas</span>
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                </svg>
                bom trabalho
              </Badge>
            </div>
            
            {/* Chart */}
            <div className="h-32 flex items-end gap-1">
              {["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"].map((month, idx) => {
                // Random heights for bars between 10% and 100%
                const height = 20 + Math.floor(Math.random() * 80);
                return (
                  <div key={month} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-full bg-blue-400 rounded-sm" 
                      style={{ height: `${height}%` }}
                    ></div>
                    <span className="text-xs mt-1 text-gray-500">{month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Suggested Topics */}
      <div>
        <h3 className="text-lg font-medium mb-4">Temas Sugeridos</h3>
        <div className="space-y-3">
          <Card className="overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <circle cx="12" cy="12" r="6"></circle>
                    <circle cx="12" cy="12" r="2"></circle>
                  </svg>
                </div>
                <span>UI & UI</span>
              </div>
              <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z"></path>
                    <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z"></path>
                    <path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z"></path>
                    <path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z"></path>
                    <path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z"></path>
                  </svg>
                </div>
                <span>Motion Designer</span>
              </div>
              <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
