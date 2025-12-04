
import { useState, useEffect } from "react";
import { CalendarWidget } from "./CalendarWidget";
import { NotificationsWidget } from "./NotificationsWidget";
import { FeedbackWidget } from "./FeedbackWidget";

export const DashboardWidgets = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Trigger animation on mount - delay reduzido
  useEffect(() => {
    // Pequeno delay para não competir com animações dos links
    requestAnimationFrame(() => {
      setTimeout(() => {
        setIsVisible(true);
      }, 50);
    });
  }, []);

  const widgets = [
    { component: CalendarWidget },
    { component: NotificationsWidget },
    { component: FeedbackWidget }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 text-left auto-rows-fr">
      {widgets.map((widget, index) => {
        return (
          <div
            key={index}
            className={`h-full transition-all duration-700 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{
              transitionDelay: `${index * 100 + 200}ms` // Delay sequencial otimizado
            }}
          >
            <widget.component />
          </div>
        );
      })}
    </div>
  );
};
