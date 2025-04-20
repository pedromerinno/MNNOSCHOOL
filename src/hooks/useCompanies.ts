
// This file re-exports the useCompanies hook from the new location
// to maintain backward compatibility with components that still import from here
import { useCompanies } from './company';

export { useCompanies };
