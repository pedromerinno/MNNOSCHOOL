
import { useState, useEffect, Suspense, lazy } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

// Lazy load dos widgets para melhor performance
const CalendarWidget = lazy(() => import("./CalendarWidget").then(module => ({ default: module.CalendarWidget })));
const NotificationsWidget = lazy(() => import("./NotificationsWidget").then(module => ({ default: module.NotificationsWidget })));
const FeedbackWidget = lazy(() => import("./FeedbackWidget").then(module => ({ default: module.FeedbackWidget })));

// Skeleton para os widgets
const WidgetSkeleton = () => (
  <Card className="border-0 shadow-none overflow-hidden rounded-[30px] bg-white dark:bg-card h-full">
    <CardContent className="p-0 flex flex-col h-full">
      <div className="p-8 flex justify-between items-center">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-5 w-8" />
      </div>
      <div className="px-8 pb-8 flex-1 space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    </CardContent>
  </Card>
);

export const DashboardWidgets = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Trigger animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const widgets = [
    { component: CalendarWidget, delay: 0 },
    { component: NotificationsWidget, delay: 200 },
    { component: FeedbackWidget, delay: 400 }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 text-left">
      {widgets.map((widget, index) => (
        <div
          key={index}
          className={`transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{
            transitionDelay: `${widget.delay + 1800}ms`
          }}
        >
          <Suspense fallback={<WidgetSkeleton />}>
            <widget.component />
          </Suspense>
        </div>
      ))}
    </div>
  );
};
