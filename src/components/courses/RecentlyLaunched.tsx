
import React from "react";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecentlyLaunchedProps {
  courses: any[];
  loading: boolean;
  companyColor: string;
}

export const RecentlyLaunched: React.FC<RecentlyLaunchedProps> = ({
  courses,
  loading,
  companyColor
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Lançados Recentemente</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="rounded-full">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {courses.slice(0, 3).map((course, index) => (
          <Link key={course.id} to={`/courses/${course.id}`} className="group">
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
              <img
                src={course.image_url || "https://source.unsplash.com/random"}
                alt={course.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
              />
              <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full">
                <span className="text-sm">{index + 1}</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                <p className="text-white/80 text-sm">{course.type || "Criação"}</p>
                <h3 className="text-white font-medium mt-1">{course.title}</h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
