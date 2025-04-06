
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Define a type for calendar day objects
interface CalendarDay {
  day: number;
  isCurrentMonth: boolean;
  isToday?: boolean;
  isPrevMonth?: boolean;
  isNextMonth?: boolean;
}

export const CalendarWidget = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Helper functions for date manipulation
  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { month: 'long' });
  };
  
  const getYear = (date: Date) => {
    return date.getFullYear();
  };
  
  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(prev => {
      const prevMonth = new Date(prev);
      prevMonth.setMonth(prev.getMonth() - 1);
      return prevMonth;
    });
  };
  
  const goToNextMonth = () => {
    setCurrentDate(prev => {
      const nextMonth = new Date(prev);
      nextMonth.setMonth(prev.getMonth() + 1);
      return nextMonth;
    });
  };
  
  // Calendar generation logic
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    // Adjust for Monday as first day of week (0 is Monday, 6 is Sunday)
    const dayOfWeek = new Date(year, month, 1).getDay();
    return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  };
  
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);
    
    // Get days from previous month to fill the first week
    const daysFromPrevMonth = firstDayOfMonth;
    const prevMonth = new Date(currentDate);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    const daysInPrevMonth = getDaysInMonth(prevMonth);
    
    // Generate previous month days
    const prevMonthDays: CalendarDay[] = Array.from({ length: daysFromPrevMonth }, (_, i) => ({
      day: daysInPrevMonth - daysFromPrevMonth + i + 1,
      isCurrentMonth: false,
      isPrevMonth: true,
      isToday: false
    }));
    
    // Generate current month days
    const currentMonthDays: CalendarDay[] = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      isCurrentMonth: true,
      isToday: isToday(new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1))
    }));
    
    // Calculate how many days from next month are needed
    const totalCells = 42; // 6 rows of 7 days
    const daysFromNextMonth = totalCells - (prevMonthDays.length + currentMonthDays.length);
    
    // Generate next month days
    const nextMonthDays: CalendarDay[] = Array.from({ length: daysFromNextMonth }, (_, i) => ({
      day: i + 1,
      isCurrentMonth: false,
      isNextMonth: true,
      isToday: false
    }));
    
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };
  
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };
  
  const calendarDays = generateCalendarDays();
  
  return (
    <Card className="border-0 shadow-md overflow-hidden bg-amber-700 text-white">
      <CardContent className="p-0">
        <div className="p-4 flex justify-between items-center">
          <h3 className="font-medium capitalize">{getMonthName(currentDate)} {getYear(currentDate)}</h3>
          <div className="flex space-x-2">
            <Button 
              size="icon" 
              variant="ghost" 
              className="text-white hover:bg-white/10 h-7 w-7"
              onClick={goToPreviousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="text-white hover:bg-white/10 h-7 w-7"
              onClick={goToNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="px-4 pb-4">
          <div className="grid grid-cols-7 text-center text-xs mb-2">
            <div>Seg</div>
            <div>Ter</div>
            <div>Qua</div>
            <div>Qui</div>
            <div>Sex</div>
            <div>Sab</div>
            <div>Dom</div>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarDays.map((day, index) => (
              <div 
                key={index} 
                className={`h-8 w-8 flex items-center justify-center text-sm rounded-full
                  ${!day.isCurrentMonth ? 'text-white/50' : ''}
                  ${day.isToday ? 'bg-white/30' : ''}
                  ${day.isCurrentMonth ? 'hover:bg-white/20 cursor-pointer' : ''}
                `}
              >
                {day.day}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
