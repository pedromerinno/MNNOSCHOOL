
import { memo } from 'react';

interface CompanyNameProps {
  displayName: string;
}

export const CompanyName = memo(({ displayName }: CompanyNameProps) => {
  return <span className="text-lg font-bold text-merinno-dark">{displayName}</span>;
});

CompanyName.displayName = 'CompanyName';
