
import React from 'react';
import { CourseView } from "@/components/courses/CourseView";
import { CourseLayout } from "@/components/courses/CourseLayout";

const CourseDetails = () => {
  return (
    <CourseLayout>
      <CourseView />
    </CourseLayout>
  );
};

export default CourseDetails;
