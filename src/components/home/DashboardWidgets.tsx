
import { useState, useEffect } from "react";
import { CalendarWidget } from "./CalendarWidget";
import { NotificationsWidget } from "./NotificationsWidget";
import { FeedbackWidget } from "./FeedbackWidget";

export const DashboardWidgets = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Trigger animation on mount - timing suave
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 400); // Delay para aparecer após os links
    return () => clearTimeout(timer);
  }, []);

  const widgets = [
    { component: CalendarWidget },
    { component: NotificationsWidget },
    { component: FeedbackWidget }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 text-left">
      {widgets.map((widget, index) => {
        return (
          <div
            key={index}
            className={`transition-all duration-700 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{
              transitionDelay: `${index * 150 + 500}ms` // Delay sequencial após os links
            }}
          >
            <widget.component />
          </div>
        );
      })}
    </div>
  );
};
