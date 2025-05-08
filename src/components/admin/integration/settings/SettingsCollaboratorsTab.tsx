
import React from 'react';
import { SettingsTabProps } from './types';
import { CollaboratorsManagement } from '../CollaboratorsManagement';

export function SettingsCollaboratorsTab({ company }: SettingsTabProps) {
  return (
    <div className="space-y-6">
      {company && <CollaboratorsManagement company={company} />}
    </div>
  );
}
