
import React from 'react';
import { CompanyThemedBadge } from "@/components/ui/badge";

interface CourseCardTagsProps {
  tags?: string[];
}

export const CourseCardTags: React.FC<CourseCardTagsProps> = ({ tags }) => {
  if (!tags || tags.length === 0) {
    return (
      <div className="flex flex-wrap gap-2">
        <CompanyThemedBadge variant="beta" className="text-xs font-normal">
          Curso
        </CompanyThemedBadge>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.slice(0, 2).map((tag, index) => (
        <CompanyThemedBadge key={index} variant="beta" className="text-xs font-normal">
          {tag}
        </CompanyThemedBadge>
      ))}
      {tags.length > 2 && (
        <CompanyThemedBadge variant="beta" className="text-xs font-normal">
          +{tags.length - 2}
        </CompanyThemedBadge>
      )}
    </div>
  );
};
