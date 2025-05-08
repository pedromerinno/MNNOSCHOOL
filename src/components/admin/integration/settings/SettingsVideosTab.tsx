
import React from 'react';
import { SettingsTabProps } from './types';
import { IntegrationVideosManager } from '../IntegrationVideosManager';

export function SettingsVideosTab({ company }: SettingsTabProps) {
  return (
    <div className="space-y-6">
      {company && <IntegrationVideosManager company={company} />}
    </div>
  );
}
