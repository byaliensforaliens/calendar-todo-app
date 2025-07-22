/**
 * Formats a Date object to YYYY-MM-DD string in local timezone
 * This avoids the timezone shifting issues that occur with toISOString()
 */
export const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Compares two dates ignoring time components
 */
export const isSameDay = (date1: Date, date2: string): boolean => {
  return formatDateForInput(date1) === date2;
};