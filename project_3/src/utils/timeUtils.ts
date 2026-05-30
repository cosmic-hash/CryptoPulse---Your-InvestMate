import { format, formatDistance, parseISO, formatISO } from 'date-fns';

// Convert UTC ISO string to MDT (UTC-06:00) formatted string
export const formatUTCtoMDT = (isoString: string, formatStr: string = 'hh:mm a') => {
  try {
    // Parse ISO string
    const date = parseISO(isoString);
    
    // Apply timezone offset for MDT (UTC-6)
    const mdtOffset = -6 * 60; // -6 hours in minutes
    const utcOffset = date.getTimezoneOffset();
    const offsetDiff = utcOffset - mdtOffset;
    
    // Adjust date for MDT
    const mdtDate = new Date(date.getTime() + offsetDiff * 60000);
    
    // Format with requested format string
    return `${format(mdtDate, formatStr)} MDT`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return isoString;
  }
};

// Format full date with time in MDT
export const formatFullDateMDT = (isoString: string) => {
  return formatUTCtoMDT(isoString, 'hh:mm a, MMM dd yyyy');
};

// Format relative time (e.g., "2 hours ago")
export const formatRelativeTime = (isoString: string) => {
  try {
    const date = parseISO(isoString);
    return formatDistance(date, new Date(), { addSuffix: true });
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'unknown time ago';
  }
};

// Get current time in ISO format
export const getCurrentISOTime = () => {
  return formatISO(new Date());
};

// Get time N hours ago in ISO format
export const getTimeHoursAgo = (hours: number) => {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return formatISO(date);
};

export default {
  formatUTCtoMDT,
  formatFullDateMDT,
  formatRelativeTime,
  getCurrentISOTime,
  getTimeHoursAgo,
};