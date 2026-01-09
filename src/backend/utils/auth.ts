/**
 * Authentication Utilities
 * 
 * JWT token generation and verification for session management.
 * Uses HTTP-only cookies for security.
 */

import jwt from 'jsonwebtoken';
import type { SessionPayload } from '@shared/types';
import { PLATFORM_CONSTANTS } from '@shared/types';

// =============================================================================
// CONFIGURATION
// =============================================================================

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

if (process.env.NODE_ENV === 'production' && JWT_SECRET === 'dev-secret-change-in-production') {
  throw new Error('JWT_SECRET must be set in production environment');
}

// =============================================================================
// TOKEN FUNCTIONS
// =============================================================================

/**
 * Generate a JWT token for a session
 */
export function generateToken(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: PLATFORM_CONSTANTS.JWT_EXPIRATION,
  });
}

/**
 * Verify and decode a JWT token
 * Returns null if token is invalid or expired
 */
export function verifyToken(token: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SessionPayload;
    return decoded;
  } catch {
    return null;
  }
}

// =============================================================================
// COOKIE OPTIONS
// =============================================================================

/**
 * Get cookie options for session cookie
 */
export function getSessionCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict' as const,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  };
}
