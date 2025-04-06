
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export const NotificationButton = () => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative text-gray-500 hover:text-merinno-blue"
    >
      <Bell className="h-5 w-5" />
      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
      <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs rounded-full">
        1
      </span>
    </Button>
  );
};
