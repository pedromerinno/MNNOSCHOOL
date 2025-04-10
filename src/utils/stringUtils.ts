
/**
 * Extracts initials from a name or string
 * @param name The name or string to extract initials from
 * @param maxLength Maximum number of initials to return
 * @returns The initials (uppercase)
 */
export function getInitials(name: string, maxLength: number = 2): string {
  if (!name) return '';
  
  // Split on spaces and other separators
  const parts = name.split(/[\s.-_@]+/);
  
  // Get the first letter of each part
  const initials = parts
    .filter(part => part.length > 0)
    .map(part => part[0].toUpperCase())
    .slice(0, maxLength)
    .join('');
    
  return initials;
}
