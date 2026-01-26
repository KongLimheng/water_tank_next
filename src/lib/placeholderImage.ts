// Generate a placeholder image URL with random background color and text
export const generatePlaceholderImage = (
  text: string,
  size: number = 200
): string => {
  // Safe function to get first character (handles Unicode properly)
  const getFirstChar = (str: string): string => {
    // Use Array.from to handle Unicode properly
    const chars = Array.from(str);
    return chars.length > 0 ? chars[0] : '';
  };

  // Extract first character of each word for initials
  const words = text.trim().split(/\s+/);
  const initials = words
    .slice(0, 2) // Take first two words at most
    .map((word) => {
      const firstChar = getFirstChar(word);
      // Check if it's a Latin character, otherwise use a fallback
      if (firstChar.match(/[A-Za-z]/)) {
        return firstChar.toUpperCase();
      }
      // For non-Latin characters, you can:
      // 1. Use the character as-is if it's renderable
      // 2. Use a fallback character
      // 3. Extract from English name part if available
      return firstChar || '?';
    })
    .join('');

  // If no valid initials found, use a generic symbol
  const displayText = initials || '?';

  // Random background colors
  const colors = [
    '#6366f1', // Indigo
    '#10b981', // Emerald
    '#3b82f6', // Blue
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#8b5cf6', // Violet
    '#06b6d4', // Cyan
    '#84cc16', // Lime
  ];

  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  // Create a simple SVG placeholder with proper XML encoding
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${randomColor}"/>
      <text 
        x="50%" 
        y="50%" 
        font-family="Arial, sans-serif, 'Khmer OS', 'Noto Sans Khmer'" 
        font-size="${size * 0.25}" 
        fill="white" 
        text-anchor="middle" 
        dy="0.35em" 
        font-weight="bold"
      >
        ${displayText}
      </text>
    </svg>
  `;

  // Clean and encode the SVG
  const cleanSvg = svg.trim();
  
  // OPTION 1: URL encode the entire SVG (recommended for data URLs)
  const encodedSvg = encodeURIComponent(cleanSvg);
  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodedSvg}`;
  
  return dataUrl;
};

// Generate a placeholder image for products
export const generateProductPlaceholder = (productName: string): string => {
  return generatePlaceholderImage(productName, 400);
};