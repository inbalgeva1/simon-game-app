/**
 * Game Code Utilities
 * 
 * Generation and validation of unique game room codes.
 */

import { PLATFORM_CONSTANTS } from '@shared/types';

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Characters used for game code generation
 * Excludes confusing characters: 0/O, 1/I/L
 */
const GAME_CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

// =============================================================================
// FUNCTIONS
// =============================================================================

/**
 * Generate a unique game code
 * 
 * @param existingCodes - Set of existing codes to avoid collisions
 * @param maxAttempts - Maximum attempts before throwing error
 * @returns A unique 6-character game code
 */
export function generateGameCode(
  existingCodes: Set<string> = new Set(),
  maxAttempts = 100
): string {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateRandomCode();
    
    if (!existingCodes.has(code)) {
      return code;
    }
  }
  
  throw new Error('Failed to generate unique game code after maximum attempts');
}

/**
 * Generate a random game code
 */
function generateRandomCode(): string {
  let code = '';
  
  for (let i = 0; i < PLATFORM_CONSTANTS.GAME_CODE_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * GAME_CODE_CHARS.length);
    code += GAME_CODE_CHARS[randomIndex];
  }
  
  return code;
}

/**
 * Format a game code for display (e.g., "ABC123" -> "ABC-123")
 */
export function formatGameCodeForDisplay(code: string): string {
  if (code.length !== PLATFORM_CONSTANTS.GAME_CODE_LENGTH) {
    return code;
  }
  
  const midpoint = Math.floor(code.length / 2);
  return `${code.slice(0, midpoint)}-${code.slice(midpoint)}`;
}

/**
 * Normalize a game code input (remove dashes, uppercase)
 */
export function normalizeGameCode(input: string): string {
  return input.replace(/-/g, '').toUpperCase().trim();
}
