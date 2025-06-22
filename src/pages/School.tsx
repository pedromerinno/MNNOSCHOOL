
import React, { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { FeaturedCourseHero } from "@/components/school/FeaturedCourseHero";
import { ContinueLearning } from "@/components/school/ContinueLearning";
import { ForumSection } from "@/components/school/ForumSection";
import { RecentCourses } from "@/components/school/RecentCourses";
import { SchoolSidebar } from "@/components/school/SchoolSidebar";
import { CourseCategories } from "@/components/school/CourseCategories";
import {
  featuredCourse,
  continueLearningCourses,
  forumTopics,
  recentCourses,
  statistics,
  suggestedTopics
} from "@/data/school-mock-data";

const School = () => {
  const [activeTab, setActiveTab] = useState("all");

  const handleCategoryChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <DashboardLayout>
      <div className="bg-[#F8F7F4] py-6">
        <div className="container mx-auto px-4 lg:px-8 flex">
          <div className="flex-1 pr-6 text-left lg:text-center">
            <FeaturedCourseHero course={featuredCourse} />
            <CourseCategories 
              activeTab={activeTab} 
              onCategoryChange={handleCategoryChange} 
            />
            <ContinueLearning courses={continueLearningCourses} />
            <ForumSection topics={forumTopics} />
            <RecentCourses courses={recentCourses} />
          </div>

          <SchoolSidebar 
            statistics={statistics}
            suggestedTopics={suggestedTopics}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default School;
