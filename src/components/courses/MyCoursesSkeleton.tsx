import React from 'react';
import { MyCoursesLayout } from './MyCoursesLayout';

// Skeleton item component with subtle shimmer effect
const SkeletonItem: React.FC<{
  className?: string;
  delay?: number;
}> = ({ className = '', delay = 0 }) => {
  return (
    <div
      className={`bg-stone-200/40 dark:bg-gray-700/40 rounded ${className}`}
      style={{
        animation: `pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
        animationDelay: `${delay}s`,
      }}
    />
  );
};

export const MyCoursesSkeleton: React.FC = () => {
  return (
    <MyCoursesLayout>
      <div className="w-full max-w-[1600px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Area */}
          <div className="flex-1 min-w-0 space-y-8">
            {/* Header Skeleton */}
            <div className="mb-8">
              <div className="hidden md:flex items-center justify-between gap-4">
                <SkeletonItem className="h-9 w-48" />
                <div className="flex-1 max-w-md mx-4">
                  <SkeletonItem className="h-10 w-full rounded-full" />
                </div>
                <div className="flex items-center gap-4">
                  <SkeletonItem className="h-6 w-16" />
                  <SkeletonItem className="h-9 w-9 rounded-full" delay={0.1} />
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <SkeletonItem
                        key={i}
                        className="h-10 w-10 rounded-full border-2 border-[#F8F7F4] dark:border-gray-900"
                        delay={i * 0.1}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="md:hidden space-y-4">
                <div className="flex items-center justify-between">
                  <SkeletonItem className="h-8 w-40" />
                  <div className="flex items-center gap-3">
                    <SkeletonItem className="h-5 w-12" delay={0.1} />
                    <SkeletonItem className="h-9 w-9 rounded-full" delay={0.2} />
                  </div>
                </div>
                <SkeletonItem className="h-10 w-full rounded-full" delay={0.1} />
              </div>
            </div>

            {/* Hero Banner Skeleton */}
            <div className="relative w-full rounded-3xl overflow-hidden mb-8">
              <div className="relative aspect-[16/7] w-full min-h-[300px] md:min-h-[400px] lg:min-h-[450px] bg-stone-200/40 dark:bg-gray-700/40">
                <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-8 lg:p-10 xl:p-12">
                  <div className="flex flex-col gap-4 md:gap-5 max-w-2xl lg:max-w-3xl">
                    <SkeletonItem className="h-8 md:h-10 lg:h-12 w-3/4" />
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3].map((i) => (
                        <SkeletonItem
                          key={i}
                          className="h-7 w-20 rounded-full"
                          delay={i * 0.1}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-end justify-between flex-wrap gap-4 mt-auto">
                    <div className="flex items-center gap-3">
                      <SkeletonItem className="h-10 w-10 md:h-12 md:w-12 rounded-full" delay={0.2} />
                      <SkeletonItem className="h-5 w-32" delay={0.3} />
                    </div>
                    <SkeletonItem className="h-12 w-36 rounded-full" delay={0.2} />
                  </div>
                </div>
              </div>
            </div>

            {/* Category Filters Skeleton */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-nowrap overflow-x-auto py-[20px]">
                {[1, 2, 3, 4].map((i) => (
                  <SkeletonItem
                    key={i}
                    className="h-11 w-28 rounded-3xl shrink-0"
                    delay={i * 0.1}
                  />
                ))}
              </div>
            </div>

            {/* Courses Grid Skeleton */}
            <div className="space-y-4">
              <SkeletonItem className="h-7 w-24" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="space-y-3">
                    <SkeletonItem className="aspect-[4/3] rounded-2xl" delay={i * 0.05} />
                    <div className="space-y-2">
                      <SkeletonItem className="h-5 w-3/4" delay={i * 0.05 + 0.1} />
                      <SkeletonItem className="h-4 w-1/2" delay={i * 0.05 + 0.15} />
                    </div>
                    <SkeletonItem className="h-2 w-full rounded-full" delay={i * 0.05 + 0.2} />
                  </div>
                ))}
              </div>
            </div>

            {/* Continue Watching Skeleton */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <SkeletonItem className="h-7 w-40" />
                <div className="flex gap-2">
                  <SkeletonItem className="h-8 w-8 rounded-full" delay={0.1} />
                  <SkeletonItem className="h-8 w-8 rounded-full" delay={0.2} />
                </div>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex-shrink-0 w-64 space-y-3">
                    <SkeletonItem className="aspect-video rounded-2xl" delay={i * 0.1} />
                    <div className="space-y-2">
                      <SkeletonItem className="h-4 w-3/4" delay={i * 0.1 + 0.1} />
                      <SkeletonItem className="h-3 w-1/2" delay={i * 0.1 + 0.15} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="w-full lg:w-96 flex-shrink-0">
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-stone-200/50 dark:border-gray-800 p-6 space-y-6 sticky top-8">
              {/* User Info Header */}
              <div className="flex items-center justify-between pb-4 border-b border-stone-200/50 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <SkeletonItem className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <SkeletonItem className="h-4 w-24" delay={0.1} />
                    <SkeletonItem className="h-3 w-32" delay={0.2} />
                  </div>
                </div>
                <SkeletonItem className="h-9 w-9 rounded-full" delay={0.1} />
              </div>

              {/* Videos Completos Card */}
              <div className="rounded-3xl overflow-hidden bg-stone-100/50 dark:bg-gray-800/50 p-6 min-h-[120px] flex items-center justify-between">
                <div className="flex-1 space-y-3">
                  <SkeletonItem className="h-5 w-32" />
                  <SkeletonItem className="h-10 w-16" delay={0.1} />
                </div>
                <SkeletonItem className="h-10 w-10 rounded-full" delay={0.2} />
              </div>

              {/* Hours Watched Card */}
              <div className="rounded-3xl overflow-hidden bg-stone-100/50 dark:bg-gray-800/50 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <SkeletonItem className="h-5 w-32" />
                  <SkeletonItem className="h-7 w-16 rounded-full" delay={0.1} />
                </div>
                <div className="flex items-baseline gap-2">
                  <SkeletonItem className="h-10 w-20" delay={0.2} />
                  <SkeletonItem className="h-5 w-12" delay={0.3} />
                </div>
                <SkeletonItem className="h-32 rounded-lg" delay={0.1} />
              </div>

              {/* Suggested Topics */}
              <div className="space-y-4">
                <SkeletonItem className="h-6 w-32" />
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <SkeletonItem
                      key={i}
                      className="h-16 w-full rounded-2xl"
                      delay={i * 0.1}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MyCoursesLayout>
  );
};

