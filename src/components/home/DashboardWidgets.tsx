
import { CalendarWidget } from "./CalendarWidget";
import { NotificationsWidget } from "./NotificationsWidget";
import { FeedbackWidget } from "./FeedbackWidget";

export const DashboardWidgets = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      <CalendarWidget />
      <NotificationsWidget />
      <FeedbackWidget />
    </div>
  );
};
