import React, { useState } from "react";
import { StandardCourseCard, StandardCourseCardProps } from "./StandardCourseCard";
import { Button } from "@/components/ui/button";

export interface CoursesGridSectionProps {
  title: string;
  courses: StandardCourseCardProps["course"][];
  loading: boolean;
  companyColor?: string;
  showParticipants?: boolean;
  showProgress?: boolean;
  showFavorite?: boolean;
  onFavoriteToggle?: (courseId: string) => void | Promise<void>;
}

const INITIAL_COURSES_COUNT = 6;

export const CoursesGridSection: React.FC<CoursesGridSectionProps> = ({
  title,
  courses,
  loading,
  companyColor,
  showParticipants = false,
  showProgress = true,
  showFavorite = true,
  onFavoriteToggle
}) => {
  const [displayedCount, setDisplayedCount] = useState(INITIAL_COURSES_COUNT);

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

  const displayedCourses = courses.slice(0, displayedCount);
  const hasMore = courses.length > displayedCount;
  const remainingCount = courses.length - displayedCount;

  const handleLoadMore = () => {
    setDisplayedCount(prev => prev + 6);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedCourses.map((course) => (
          <StandardCourseCard
            key={course.id}
            course={course}
            companyColor={companyColor}
            showParticipants={showParticipants}
            showProgress={showProgress && course.progress !== undefined && course.progress > 0}
            showFavorite={showFavorite}
            onFavoriteToggle={onFavoriteToggle}
            variant="vertical"
          />
        ))}
      </div>
      
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            className="px-6"
          >
            Carregar mais {remainingCount > 6 ? "6" : remainingCount} {remainingCount === 1 ? "curso" : "cursos"}
          </Button>
        </div>
      )}
    </div>
  );
};

