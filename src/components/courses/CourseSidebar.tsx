
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Clock, Heart, TrendingUp } from "lucide-react";
import { CourseStats } from "@/hooks/my-courses/types";

interface CourseSidebarProps {
  stats: CourseStats;
  hoursWatched: number;
}

export const CourseSidebar: React.FC<CourseSidebarProps> = ({ stats, hoursWatched }) => {
  const { completed, inProgress, favorites, videosCompleted } = stats;
  
  // Mock data for the chart
  const monthlyProgress = [
    { month: "Jan", hours: 1.2 },
    { month: "Fev", hours: 0.8 },
    { month: "Mar", hours: 2.5 },
    { month: "Abr", hours: 1.7 },
    { month: "Mai", hours: 0.9 },
    { month: "Jun", hours: 1.3 },
    { month: "Jul", hours: 3.2 },
    { month: "Ago", hours: 2.8 },
    { month: "Set", hours: 2.1 },
    { month: "Out", hours: 1.5 },
    { month: "Nov", hours: 2.0 },
    { month: "Dez", hours: 0.5 },
  ];
  
  // Find max value for scaling
  const maxHours = Math.max(...monthlyProgress.map(item => item.hours));
  
  return (
    <>
      {/* Stats overview card */}
      <Card className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Seu progresso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800/30 rounded-xl p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Award className="h-4 w-4 text-emerald-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Concluídos</span>
              </div>
              <p className="text-2xl font-semibold">{completed}</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800/30 rounded-xl p-3">
              <div className="flex items-center space-x-2 mb-1">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Em progresso</span>
              </div>
              <p className="text-2xl font-semibold">{inProgress}</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800/30 rounded-xl p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Favoritos</span>
              </div>
              <p className="text-2xl font-semibold">{favorites}</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800/30 rounded-xl p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Clock className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Horas</span>
              </div>
              <p className="text-2xl font-semibold">{hoursWatched}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Hours watched chart */}
      <Card className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Horas assistidas</CardTitle>
            <div className="flex items-center px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 rounded-full text-xs">
              <span>Bom trabalho</span>
            </div>
          </div>
          <p className="text-3xl font-semibold mt-1">{hoursWatched} horas</p>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="flex items-end h-28 gap-1 mt-2">
            {monthlyProgress.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-400 dark:bg-blue-500 rounded-t-sm" 
                  style={{ 
                    height: `${(item.hours / maxHours) * 100}%`,
                    minHeight: "4px"
                  }}
                ></div>
                <span className="text-[10px] text-gray-500 mt-1">{item.month}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
};
