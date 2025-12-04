
export const calculateTotalDuration = (lessons: Array<{ duration?: string | null }>) => {
  const totalDuration = lessons?.reduce((total, lesson) => {
    const minutes = lesson.duration 
      ? parseInt(lesson.duration.replace(/[^0-9]/g, '')) 
      : 0;
    return total + minutes;
  }, 0) || 0;
  
  const hours = Math.floor(totalDuration / 60);
  const minutes = totalDuration % 60;
  
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}min`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${minutes}min`;
  }
};

// Helper to format individual lesson durations
export const formatDuration = (duration: string | null | undefined): string => {
  if (!duration) return '';
  
  // Extract the numeric value
  const minutes = parseInt(duration.replace(/[^0-9]/g, ''));
  
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes > 0) {
      return `${hours}h ${remainingMinutes}min`;
    } else {
      return `${hours}h`;
    }
  } else {
    return `${minutes}min`;
  }
};

/**
 * Converts a duration string (e.g., "15min", "1h 30min", "2h") to decimal hours
 * @param duration - Duration string from database (e.g., "15min", "1h 30min")
 * @returns Decimal hours (e.g., 0.25 for 15min, 1.5 for 1h 30min)
 */
export const durationToHours = (duration: string | null | undefined): number => {
  if (!duration) return 0;
  
  const trimmed = duration.trim().toLowerCase();
  
  // Extract hours and minutes using regex
  const hourMatch = trimmed.match(/(\d+)\s*h/);
  const minuteMatch = trimmed.match(/(\d+)\s*min/);
  
  const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
  const minutes = minuteMatch ? parseInt(minuteMatch[1], 10) : 0;
  
  // If no hour or minute pattern found, try to extract just numbers (assume minutes)
  if (hours === 0 && minutes === 0) {
    const numbers = duration.match(/\d+/);
    if (numbers) {
      // Assume it's minutes if no pattern matched
      return parseInt(numbers[0], 10) / 60;
    }
  }
  
  return hours + (minutes / 60);
};
