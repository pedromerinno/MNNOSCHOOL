
import { CourseCard } from "./CourseCard";

// Example course data
const courses = [
  {
    id: "1",
    title: "Introdução ao Marketing Digital",
    instructor: "Maria Silva",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    progress: 75,
    duration: "10h 30m",
    lessonsCount: 12,
  },
  {
    id: "2",
    title: "Fundamentos de UX/UI Design",
    instructor: "Carlos Oliveira",
    image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    progress: 35,
    duration: "8h 45m",
    lessonsCount: 10,
  },
  {
    id: "3",
    title: "Programação Web para Iniciantes",
    instructor: "Lucas Mendes",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    progress: 10,
    duration: "15h 20m",
    lessonsCount: 18,
  },
  {
    id: "4",
    title: "Gestão de Projetos Ágeis",
    instructor: "Ana Ferreira",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    progress: 0,
    duration: "12h 15m",
    lessonsCount: 14,
  },
];

interface CourseListProps {
  title: string;
  filter?: "all" | "in-progress" | "completed" | "not-started";
}

export const CourseList = ({ title, filter = "all" }: CourseListProps) => {
  // Filter courses based on the filter prop
  const filteredCourses = courses.filter((course) => {
    if (filter === "all") return true;
    if (filter === "in-progress") return course.progress > 0 && course.progress < 100;
    if (filter === "completed") return course.progress === 100;
    if (filter === "not-started") return course.progress === 0;
    return true;
  });

  return (
    <div className="mb-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {filteredCourses.length > 4 && (
          <a href="#" className="text-sm text-merinno-blue hover:underline">
            Ver todos
          </a>
        )}
      </div>
      
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} {...course} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-gray-500">Nenhum curso encontrado</p>
        </div>
      )}
    </div>
  );
};
