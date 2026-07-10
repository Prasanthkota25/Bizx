// Convert string to Title Case (capitalize first letter of each word)
export const toTitleCase = (str) => {
  if (!str) return '-';

  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Format full name from firstname and lastname with proper spacing
export const formatFullName = (firstname, lastname) => {
  const first = toTitleCase(firstname);
  const last = toTitleCase(lastname);
  
  if (first === '-' && last === '-') return '-';
  if (first === '-') return last;
  if (last === '-') return first;
  
  return `${first} ${last}`;
};

// Format name with proper spacing - handles both single strings and separate names
export const formatName = (firstOrFull, lastname) => {
  // If lastname is provided, use formatFullName
  if (lastname) {
    return formatFullName(firstOrFull, lastname);
  }
  
  // Otherwise, treat firstOrFull as a full string and apply title case with proper spacing
  if (!firstOrFull) return '-';
  
  let str = String(firstOrFull).trim();
  if (!str) return '-';
  
  // First, convert camelCase to spaces
  // Add space before uppercase letters that follow lowercase letters
  str = str.replace(/([a-z])([A-Z])/g, '$1 $2');
  
  // Add space before uppercase letters followed by lowercase (for things like "PRADAYXYz")
  str = str.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
  
  // Handle underscores and hyphens as separators
  str = str.replace(/[_-]+/g, ' ');
  
  // Now apply Title Case with proper spacing
  let formatted = str
    .toLowerCase()
    .split(/[\s]+/) // Split by any whitespace
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return formatted || '-';
};
