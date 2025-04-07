
import React from 'react';
import { CourseView } from "@/components/courses/CourseView";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

const CourseDetails = () => {
  return (
    <DashboardLayout>
      <CourseView />
    </DashboardLayout>
  );
};

export default CourseDetails;
