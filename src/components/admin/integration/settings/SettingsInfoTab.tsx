
import React from 'react';
import { SettingsTabProps } from './types';
import { CompanyIntegrationForm } from '../CompanyIntegrationForm';

export function SettingsInfoTab({ company, onSubmit, isSaving }: SettingsTabProps) {
  return (
    <div className="space-y-6">
      <CompanyIntegrationForm 
        company={company}
        onSubmit={onSubmit}
        isSaving={isSaving}
      />
    </div>
  );
}
