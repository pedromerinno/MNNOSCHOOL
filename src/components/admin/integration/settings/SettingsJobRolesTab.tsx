
import React from 'react';
import { SettingsTabProps } from './types';
import { JobRolesManager } from '../JobRolesManager';

export function SettingsJobRolesTab({ company }: SettingsTabProps) {
  return (
    <div className="space-y-6">
      {company && <JobRolesManager company={company} />}
    </div>
  );
}
