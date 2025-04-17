
import React from 'react';
import { CompanyThemedBadge } from "@/components/ui/badge";

interface CourseCardTagsProps {
  tags?: string[];
  className?: string;
}

export const CourseCardTags: React.FC<CourseCardTagsProps> = ({ tags, className }) => {
  if (!tags || tags.length === 0) {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        <CompanyThemedBadge 
          variant="beta" 
          className="text-xs font-normal text-white bg-white/20 border-white/30"
        >
          Curso
        </CompanyThemedBadge>
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.slice(0, 2).map((tag, index) => (
        <CompanyThemedBadge 
          key={index} 
          variant="beta" 
          className="text-xs font-normal text-white bg-white/20 border-white/30"
        >
          {tag}
        </CompanyThemedBadge>
      ))}
      {tags.length > 2 && (
        <CompanyThemedBadge 
          variant="beta" 
          className="text-xs font-normal text-white bg-white/20 border-white/30"
        >
          +{tags.length - 2}
        </CompanyThemedBadge>
      )}
    </div>
  );
};
