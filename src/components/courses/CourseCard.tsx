
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

interface CourseCardProps {
  id: string;
  title: string;
  instructor: string;
  image: string;
  progress: number;
  duration: string;
  lessonsCount: number;
}

export const CourseCard = ({
  id,
  title,
  instructor,
  image,
  progress,
  duration,
  lessonsCount,
}: CourseCardProps) => {
  return (
    <Link
      to={`/courses/${id}`}
      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow group"
    >
      <div className="aspect-video relative overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-start p-4">
          <span className="text-white text-sm font-medium">Continuar Curso</span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">{title}</h3>
        <p className="text-sm text-gray-500 mb-3">{instructor}</p>
        
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{progress}% completo</span>
            <span>{Math.round(lessonsCount * progress / 100)}/{lessonsCount} aulas</span>
          </div>
          <Progress value={progress} className="h-1" />
        </div>
        
        <div className="flex justify-between text-xs text-gray-500">
          <span>{duration}</span>
          <span>{lessonsCount} aulas</span>
        </div>
      </div>
    </Link>
  );
};
