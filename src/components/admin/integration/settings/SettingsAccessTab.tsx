
import React from 'react';
import { SettingsTabProps } from './types';
import { AccessManagement } from '../AccessManagement';

export function SettingsAccessTab({ company }: SettingsTabProps) {
  return (
    <div className="space-y-6">
      {company && <AccessManagement company={company} />}
    </div>
  );
}
