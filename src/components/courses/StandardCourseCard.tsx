import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { StandardCourse, StandardCourseCardConfig } from "./types/StandardCourse";

export interface StandardCourseCardProps extends StandardCourseCardConfig {
  course: StandardCourse;
  className?: string;
}

export const StandardCourseCard: React.FC<StandardCourseCardProps> = ({
  course,
  companyColor = "#3B82F6",
  showParticipants = false,
  showProgress = true,
  showFavorite = true,
  onFavoriteToggle,
  variant = "horizontal",
  className = ""
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/courses/${course.id}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFavoriteToggle) {
      onFavoriteToggle(course.id);
    }
  };

  const handleNavigationClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/courses/${course.id}`);
  };

  const cardWidth = variant === "horizontal" ? "w-[380px]" : "w-full";
  const imageHeight = variant === "horizontal" ? "h-64" : "aspect-video";

  return (
    <Card
      className={`${cardWidth} flex-shrink-0 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 transition-all duration-300 cursor-pointer group ${className}`}
      onClick={handleCardClick}
    >
      {/* Image Section */}
      <div className={`relative ${imageHeight} overflow-hidden bg-gray-100 dark:bg-gray-900`}>
        <img
          src={course.image_url || "/placeholder.svg"}
          alt={course.title}
          className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder.svg";
          }}
        />
        
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Favorite icon */}
        {showFavorite && (
          <div className="absolute top-3 right-3 z-10">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40 border border-white/30 p-0 transition-all"
              onClick={handleFavoriteClick}
            >
              <Heart 
                className={`h-4 w-4 stroke-2 ${
                  course.favorite 
                    ? "fill-red-500 text-red-500" 
                    : "text-white"
                }`} 
              />
            </Button>
          </div>
        )}
      </div>

      <CardContent className="p-5 space-y-4">
        {/* Tags */}
        <div className="flex items-center gap-2 flex-wrap">
          {course.tags?.slice(0, 3).map((tag: string, i: number) => (
            <Badge
              key={i}
              variant="outline"
              className="bg-white dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 rounded-full px-3 py-1 border-gray-200 dark:border-gray-700 h-7"
            >
              {tag}
            </Badge>
          ))}
          {course.tags && course.tags.length > 3 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 p-0"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <span className="text-xs text-gray-600 dark:text-gray-300 leading-none font-medium">
                +{course.tags.length - 3}
              </span>
            </Button>
          )}
        </div>

        {/* Progress bar */}
        {showProgress && course.progress !== undefined && course.progress > 0 && (
          <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${course.progress}%`,
                backgroundColor: companyColor
              }}
            />
          </div>
        )}

        {/* Course Title */}
        <h3 className="font-bold text-lg leading-tight line-clamp-2 text-gray-900 dark:text-white">
          {course.title}
        </h3>

        {/* Participants and Navigation */}
        {showParticipants && (
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2.5">
              <div className="flex -space-x-2">
                {course.participants?.slice(0, 3).map((participant, i) => (
                  <Avatar
                    key={participant.id || i}
                    className="h-7 w-7 border-2 border-white dark:border-gray-800"
                  >
                    {participant.avatar_url ? (
                      <AvatarImage src={participant.avatar_url} alt={participant.name} />
                    ) : null}
                    <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-[11px] font-medium">
                      {participant.name
                        ? participant.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)
                        : `U${i + 1}`}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {!course.participants && (
                  <>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Avatar
                        key={i}
                        className="h-7 w-7 border-2 border-white dark:border-gray-800"
                      >
                        <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-[11px] font-medium">
                          U{i + 1}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </>
                )}
              </div>
              {(course.participantsCount !== undefined || 
                (course.participants && course.participants.length > 3)) && (
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 bg-orange-100 dark:bg-orange-900/40 px-2.5 py-1 rounded-md">
                  +{course.participantsCount || 
                    (course.participants ? course.participants.length - 3 : 0)}
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 p-0 transition-colors"
              onClick={handleNavigationClick}
            >
              <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </Button>
          </div>
        )}

        {/* Navigation arrow when no participants */}
        {!showParticipants && (
          <div className="flex items-center justify-end pt-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 p-0 transition-colors"
              onClick={handleNavigationClick}
            >
              <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

