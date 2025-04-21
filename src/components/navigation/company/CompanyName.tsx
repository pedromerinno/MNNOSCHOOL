
import { memo, useEffect, useState } from 'react';

interface CompanyNameProps {
  displayName: string;
}

export const CompanyName = memo(({ displayName }: CompanyNameProps) => {
  const [name, setName] = useState(displayName);

  // Ensure displayed name gets updated when prop changes
  useEffect(() => {
    setName(displayName);
  }, [displayName]);

  return <span className="text-lg font-bold text-merinno-dark">{name}</span>;
});

CompanyName.displayName = 'CompanyName';
