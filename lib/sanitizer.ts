/**
 * Strips out system-level prompt injection keywords to prevent
 * users from hijacking the LLM or performing prompt injections.
 *
 * @param input The raw input string from the user.
 * @param maxLength Maximum allowed length for the input to prevent token exhaustion attacks.
 * @returns Sanitized string.
 */
export function sanitizeUserPrompt(input: string, maxLength: number = 2000): string {
  if (!input) return ''
  let safeInput = input.trim().substring(0, maxLength)
  
  // Basic heuristic filtering for common prompt injection attempts
  const badPatterns = [
    /ignore all previous instructions/gi,
    /disregard previous instructions/gi,
    /you are an administrative/gi,
    /system prompt/gi,
    /<\|system\|>/gi,
    /<\|assistant\|>/gi,
    /forget everything/gi,
    /bypass security/gi,
    /forget previous instructions/gi
  ]

  for (const pattern of badPatterns) {
    safeInput = safeInput.replace(pattern, '[REDACTED_COMMAND]')
  }

  // Escape special characters if necessary (Optional, LLMs handle most raw text fine, 
  // but removing backticks or HTML tags can help depending on context).
  
  return safeInput
}
