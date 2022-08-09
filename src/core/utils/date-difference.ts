export function dateDifference(newestDate: Date, oldestDate: Date): string {
  const diffTime = newestDate.getTime() - oldestDate.getTime();
  const diffSeconds = Math.floor(diffTime / 1000);
  if (diffSeconds < 60) return diffSeconds.toString() + 's';
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return diffMinutes.toString() + 'm';
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return diffHours.toString() + 'h';
  const diffDays = Math.floor(diffHours / 24);
  return diffDays.toString() + 'd';
}