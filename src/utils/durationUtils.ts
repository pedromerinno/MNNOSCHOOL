
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
