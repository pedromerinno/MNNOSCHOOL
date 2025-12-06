import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  loading?: boolean;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  icon,
  title,
  value, 
  loading = false,
  className = ''
}) => {
  return (
    <Card className={`border border-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 rounded-2xl ${className}`}>
      <CardContent className="p-8">
        <div className="flex items-center justify-between gap-6">
          {/* Left side: Icon and text */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Circular icon container */}
            <div 
              className="flex-shrink-0 w-12 h-12 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-transparent"
            >
              <div className="text-gray-900 dark:text-gray-100">
                {icon}
              </div>
            </div>
            
            {/* Text content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-medium text-gray-900 dark:text-white leading-tight">
                {title}
              </h3>
            </div>
          </div>

          {/* Right side: Value */}
          <div className="flex-shrink-0 flex items-center">
            {loading ? (
              <div className="h-12 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            ) : (
              <p 
                className="text-4xl font-bold text-gray-900 dark:text-white"
              >
                {value}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};






