
import React from 'react';
import { SettingsTabProps } from './types';
import { CompanyCourseManagement } from '../CompanyCourseManagement';

export function SettingsCoursesTab({ company }: SettingsTabProps) {
  return (
    <div className="space-y-6">
      {company && <CompanyCourseManagement company={company} />}
    </div>
  );
}
