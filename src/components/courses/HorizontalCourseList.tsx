import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StandardCourseCard, StandardCourseCardProps } from "./StandardCourseCard";

export interface HorizontalCourseListProps {
  title: string;
  courses: StandardCourseCardProps["course"][];
  loading: boolean;
  companyColor: string;
  showParticipants?: boolean;
  onFavoriteToggle?: (courseId: string) => void | Promise<void>;
}

export const HorizontalCourseList: React.FC<HorizontalCourseListProps> = ({
  title,
  courses,
  loading,
  companyColor,
  showParticipants = false,
  onFavoriteToggle
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-8 w-8"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-8 w-8"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none"
        }}
      >
        {courses.map((course) => (
          <StandardCourseCard
            key={course.id}
            course={course}
            companyColor={companyColor}
            showParticipants={showParticipants}
            showProgress={course.progress !== undefined && course.progress > 0}
            showFavorite={true}
            onFavoriteToggle={onFavoriteToggle}
            variant="horizontal"
          />
        ))}
      </div>
    </div>
  );
};

