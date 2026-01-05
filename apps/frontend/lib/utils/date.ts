/**
 * Date formatting utilities
 */

/**
 * Format an ISO date string to a human-readable format
 * @param isoString - ISO date string (e.g., "2026-01-05T18:16:49.933Z")
 * @returns Human-readable date string in local time
 */
export function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return isoString; // Return original if invalid
    }

    // Format as local date and time
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
  } catch (error) {
    console.error('Failed to format date:', error);
    return isoString;
  }
}

/**
 * Format a timestamp to show relative time (e.g., "in 5 minutes", "2 hours ago")
 * @param isoString - ISO date string
 * @returns Relative time string
 */
export function formatRelativeTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffSeconds = Math.floor(Math.abs(diffMs) / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMs > 0) {
      // Future date
      if (diffMinutes < 1) return 'in less than a minute';
      if (diffMinutes < 60) return `in ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
      if (diffHours < 24) return `in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
      return `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } else {
      // Past date
      if (diffMinutes < 1) return 'less than a minute ago';
      if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
  } catch (error) {
    console.error('Failed to format relative time:', error);
    return formatDateTime(isoString);
  }
}

/**
 * Format a date for display in login attempt messages
 * @param isoString - ISO date string
 * @returns Formatted string for login messages
 */
export function formatLoginBlockTime(isoString: string): string {
  try {
    const relativeTime = formatRelativeTime(isoString);
    const localTime = formatDateTime(isoString);
    return `${relativeTime} (${localTime})`;
  } catch (error) {
    console.error('Failed to format login block time:', error);
    return isoString;
  }
}