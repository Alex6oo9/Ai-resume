const MAX_LENGTH = 8000;

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/gi,
  /ignore\s+(all\s+)?instructions/gi,
  /disregard\s+(all\s+)?previous/gi,
  /you\s+are\s+now/gi,
  /new\s+instructions/gi,
  /system\s*:/gi,
  /assistant\s*:/gi,
  /\[system\]/gi,
  /\[assistant\]/gi,
  /<<\s*SYS\s*>>/gi,
];

/**
 * Sanitize user-provided text before injecting into AI prompts.
 * - Strips common prompt injection phrases
 * - Removes null bytes and control characters (except newlines/tabs)
 * - Truncates to MAX_LENGTH characters
 */
export function sanitizePromptInput(text: string): string {
  if (!text) return '';

  // Strip null bytes and control characters (keep \n \r \t)
  let sanitized = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Strip injection patterns
  for (const pattern of INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[redacted]');
  }

  // Truncate
  if (sanitized.length > MAX_LENGTH) {
    sanitized = sanitized.slice(0, MAX_LENGTH);
  }

  return sanitized;
}
