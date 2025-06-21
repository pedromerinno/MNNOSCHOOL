
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export const IndexSkeleton = () => {
  return (
    <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#191919]">
      {/* Header skeleton */}
      <div className="sticky top-0 z-40 w-full border-b shadow-sm bg-[#F8F7F4] dark:bg-[#191919] h-16">
        <div className="w-full px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4 md:space-x-8">
            <Skeleton className="h-8 w-24" /> {/* Logo */}
            <div className="hidden md:flex space-x-6">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-18" />
              <Skeleton className="h-4 w-14" />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome section skeleton */}
        <div className="mb-16 mt-10">
          <div className="flex flex-col items-center">
            <Skeleton className="h-7 w-40 mb-6 rounded-full" /> {/* User greeting */}
            <Skeleton className="h-20 w-[600px] mb-5" /> {/* Company phrase */}
            <Skeleton className="h-10 w-32 rounded-full" /> {/* Learn more button */}
          </div>
        </div>

        {/* Quick Links skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-12">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="border-0 shadow-none overflow-hidden rounded-[30px] bg-white dark:bg-[#222222]">
              <CardContent className="p-6 flex flex-col">
                <div className="flex items-center mb-2">
                  <span className="mr-3 bg-gray-100 dark:bg-[#1F1F1F] p-2 rounded-lg">
                    <Skeleton className="h-5 w-5" />
                  </span>
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Dashboard Widgets skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {/* Calendar Widget */}
          <Card className="border-0 shadow-none overflow-hidden rounded-[30px] bg-white dark:bg-card h-full">
            <CardContent className="p-0 flex flex-col h-full">
              <div className="p-8 flex justify-between items-center border-b border-gray-100 dark:border-gray-800">
                <Skeleton className="h-6 w-20" /> {/* Calendar title */}
                <Skeleton className="h-8 w-8" /> {/* Calendar icon */}
              </div>
              <div className="px-8 pb-8 flex-1 pt-6">
                {/* Calendar header */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                    <Skeleton key={i} className="h-6 w-6 mx-auto" />
                  ))}
                </div>
                
                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1">
                  {Array(35).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-8 mx-auto" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications Widget */}
          <Card className="border-0 shadow-none overflow-hidden rounded-[30px] bg-white dark:bg-card h-full">
            <CardContent className="p-0 flex flex-col h-full">
              <div className="p-8 flex justify-between items-center border-b border-gray-100 dark:border-gray-800">
                <Skeleton className="h-6 w-32" /> {/* Notifications title */}
                <Skeleton className="h-5 w-8" /> {/* Count */}
              </div>
              <div className="px-8 pb-8 flex-1 space-y-4 pt-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start space-x-3 p-3 rounded-lg">
                    <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Feedback Widget */}
          <Card className="border-0 shadow-none overflow-hidden rounded-[30px] bg-white dark:bg-card h-full">
            <CardContent className="p-0 flex flex-col h-full">
              <div className="p-8 flex justify-between items-center border-b border-gray-100 dark:border-gray-800">
                <Skeleton className="h-6 w-24" /> {/* Feedback title */}
                <Skeleton className="h-5 w-8" /> {/* Count */}
              </div>
              <div className="px-8 pb-8 flex-1 space-y-4 pt-6">
                {[1, 2].map((i) => (
                  <div key={i} className="p-4 rounded-lg border border-gray-100 dark:border-gray-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer skeleton */}
      <footer className="py-6 text-center">
        <div className="container mx-auto px-4">
          <Skeleton className="h-4 w-20 mx-auto" />
        </div>
      </footer>
    </div>
  );
};
