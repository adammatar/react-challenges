import DOMPurify from 'dompurify';

/**
 * Formats a date into a readable string
 */
export const formatDate = (date: Date | null): string => {
  if (!date) return 'Invalid Date';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Calculates points based on difficulty and time bonus
 */
export const calculatePoints = (difficulty: 'Easy' | 'Medium' | 'Hard', timeBonus: number = 0): number => {
  const basePoints = {
    'Easy': 100,
    'Medium': 200,
    'Hard': 300
  };
  return basePoints[difficulty] + timeBonus;
};

/**
 * Validates email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitizes HTML content by removing dangerous tags and attributes
 */
export const sanitizeHtml = (html: string): string => {
  const allowedTags = ['p', 'strong', 'em', 'b', 'i', 'u', 'a', 'ul', 'ol', 'li'];
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: allowedTags,
    KEEP_CONTENT: true
  });
};

/**
 * Creates a debounced version of a function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void => {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), wait);
  };
};

/**
 * Sorts an array of objects by a specified property
 */
export const sortByProperty = <T extends Record<string, any>>(
  array: T[],
  property: keyof T,
  order: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...array].sort((a, b) => {
    if (a[property] < b[property]) return order === 'asc' ? -1 : 1;
    if (a[property] > b[property]) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Groups an array of objects by a specified property
 */
export const groupByProperty = <T extends Record<string, any>>(
  array: T[],
  property: keyof T
): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const key = String(item[property]);
    groups[key] = groups[key] || [];
    groups[key].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}; 