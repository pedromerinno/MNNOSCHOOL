
export const calculateTotalDuration = (lessons: Array<{ duration?: string | null }>) => {
  const totalDuration = lessons?.reduce((total, lesson) => {
    const minutes = lesson.duration 
      ? parseInt(lesson.duration.replace(/[^0-9]/g, '')) 
      : 0;
    return total + minutes;
  }, 0) || 0;
  
  const hours = Math.floor(totalDuration / 60);
  const minutes = totalDuration % 60;
  
  return hours > 0 
    ? `${hours}h ${minutes > 0 ? `${minutes} min` : ''}` 
    : `${minutes} min`;
};
