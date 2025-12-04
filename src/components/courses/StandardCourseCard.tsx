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

  const cardWidth = variant === "horizontal" ? "w-[320px]" : "w-full";
  const imageHeight = variant === "horizontal" ? "h-56" : "aspect-video";

  return (
    <Card
      className={`${cardWidth} flex-shrink-0 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow cursor-pointer group ${className}`}
      onClick={handleCardClick}
    >
      {/* Image Section */}
      <div className={`relative ${imageHeight}`}>
        <img
          src={course.image_url || "/placeholder.svg"}
          alt={course.title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder.svg";
          }}
        />
        
        {/* Favorite icon */}
        {showFavorite && (
          <div className="absolute top-2 right-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full bg-transparent hover:bg-white/10 border border-white/50 p-0"
              onClick={handleFavoriteClick}
            >
              <Heart 
                className={`h-3.5 w-3.5 stroke-2 ${
                  course.favorite 
                    ? "fill-red-500 text-red-500" 
                    : "text-white"
                }`} 
              />
            </Button>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Tags */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {course.tags?.slice(0, 3).map((tag: string, i: number) => (
            <Badge
              key={i}
              variant="outline"
              className="bg-white dark:bg-gray-800 text-xs font-normal text-gray-700 dark:text-gray-300 rounded-full px-2 py-0.5 border-gray-200 dark:border-gray-700 h-6"
            >
              {tag}
            </Badge>
          ))}
          {course.tags && course.tags.length > 3 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 p-0"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <span className="text-xs text-gray-600 dark:text-gray-300 leading-none">
                +{course.tags.length - 3}
              </span>
            </Button>
          )}
        </div>

        {/* Progress bar */}
        {showProgress && course.progress !== undefined && course.progress > 0 && (
          <div className="h-0.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${course.progress}%`,
                backgroundColor: companyColor
              }}
            />
          </div>
        )}

              {/* Course Title */}
              <h3 className="font-semibold text-base leading-tight line-clamp-2 text-gray-900 dark:text-white">
                {course.title}
              </h3>

        {/* Participants and Navigation */}
        {showParticipants && (
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {course.participants?.slice(0, 3).map((participant, i) => (
                  <Avatar
                    key={participant.id || i}
                    className="h-6 w-6 border-2 border-white dark:border-gray-800"
                  >
                    {participant.avatar_url ? (
                      <AvatarImage src={participant.avatar_url} alt={participant.name} />
                    ) : null}
                    <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-[10px]">
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
                        className="h-6 w-6 border-2 border-white dark:border-gray-800"
                      >
                        <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-[10px]">
                          U{i + 1}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </>
                )}
              </div>
              {(course.participantsCount !== undefined || 
                (course.participants && course.participants.length > 3)) && (
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 bg-orange-100 dark:bg-orange-900/40 px-2 py-0.5 rounded">
                  +{course.participantsCount || 
                    (course.participants ? course.participants.length - 3 : 0)}
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 p-0"
              onClick={handleNavigationClick}
            >
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            </Button>
          </div>
        )}

        {/* Navigation arrow when no participants */}
        {!showParticipants && (
          <div className="flex items-center justify-end pt-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 p-0"
              onClick={handleNavigationClick}
            >
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

