
import React from 'react';
import { CourseStatsBar } from '../CourseStatsBar';
import { CourseProgressBox } from '../CourseProgressBox';
import { CourseContent } from '../CourseContent';

interface CourseMainContentProps {
  totalDuration: string;
  lessonCount: number;
  tags: string[] | undefined;
  progress: number;
  description: string | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  companyColor: string;
}

export const CourseMainContent: React.FC<CourseMainContentProps> = React.memo(({
  totalDuration,
  lessonCount,
  tags,
  progress,
  description,
  activeTab,
  setActiveTab,
  companyColor
}) => {
  return (
    <div className="space-y-8">
      <CourseStatsBar
        duration={totalDuration}
        lessonCount={lessonCount}
        tags={tags}
      />

      <CourseProgressBox progress={progress} />

      <CourseContent 
        description={description}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        companyColor={companyColor}
      />
    </div>
  );
});
