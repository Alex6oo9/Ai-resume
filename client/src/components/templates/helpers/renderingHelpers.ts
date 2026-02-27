/**
 * Pure rendering helpers shared by all template components.
 */

export function formatHeading(
  text: string,
  format: 'uppercase' | 'titlecase' | 'lowercase'
): string {
  switch (format) {
    case 'uppercase':
      return text.toUpperCase();
    case 'lowercase':
      return text.toLowerCase();
    default:
      return text;
  }
}

/**
 * Split a responsibilities/description string into bullet lines.
 * Splits on newlines, strips leading bullet/dash/asterisk prefixes.
 */
export function parseResponsibilities(text: string): string[] {
  if (!text) return [];
  return text
    .split('\n')
    .map((line) => line.replace(/^[•\-\*]\s*/, '').trim())
    .filter((line) => line.length > 0);
}
