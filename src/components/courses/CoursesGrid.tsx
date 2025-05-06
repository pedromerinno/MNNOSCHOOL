import React from "react";
import { useNavigate } from "react-router-dom";
interface Course {
  id: string;
  title: string;
  image_url?: string;
  tags?: string[];
}
interface CoursesGridProps {
  courses: Course[];
}
export const CoursesGrid: React.FC<CoursesGridProps> = ({
  courses
}) => {
  const navigate = useNavigate();
  return <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {courses.map(course => <div key={course.id} className="group relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer" onClick={() => navigate(`/courses/${course.id}`)}>
          <img src={course.image_url || "https://source.unsplash.com/random"} alt={course.title} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" onError={e => {
        const target = e.target as HTMLImageElement;
        target.src = "/placeholder.svg";
      }} />
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent px-[20px] py-[20px]">
            <div className="flex gap-2 mb-2">
              {course.tags?.slice(0, 3).map((tag: string, index: number) => <span key={index} className="px-4 py-1.5 text-xs rounded-xl bg-white/20 text-white border border-white/40">
                  {tag}
                </span>)}
              {course.tags && course.tags.length > 3 && <span className="px-4 py-1.5 text-xs rounded-xl bg-white/20 text-white border border-white/40">
                  +{course.tags.length - 3}
                </span>}
            </div>
            <h3 className="text-white font-medium">{course.title}</h3>
          </div>
        </div>)}
    </div>;
};