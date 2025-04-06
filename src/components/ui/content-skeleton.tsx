
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ContentSkeletonProps {
  lines?: number;
  height?: number;
  width?: string | number;
  className?: string;
  animate?: boolean;
}

export const ContentSkeleton: React.FC<ContentSkeletonProps> = ({
  lines = 3,
  height = 24,
  width = "100%",
  className = "",
  animate = true,
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={`h-${height} ${typeof width === 'string' ? width : `w-[${width}px]`} ${animate ? 'animate-pulse' : ''}`}
          style={{ 
            width: typeof width === 'string' ? width : `${width}px`,
            height: `${height}px`,
            opacity: 1 - (i * 0.15)  // Each line gets a bit lighter
          }}
        />
      ))}
    </div>
  );
};

export const CircleSkeleton: React.FC<{size?: number; className?: string}> = ({
  size = 40,
  className = "",
}) => {
  return (
    <Skeleton 
      className={`rounded-full ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
};

export const CardSkeleton: React.FC<{className?: string}> = ({
  className = "",
}) => {
  return (
    <div className={`rounded-md border p-4 ${className}`}>
      <Skeleton className="h-8 w-3/4 mb-4" />
      <ContentSkeleton lines={3} height={16} />
    </div>
  );
};
