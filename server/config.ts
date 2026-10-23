/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import crypto from 'crypto';
import path from 'path';

export const FORBIDDEN_SESSION_PLACEHOLDER = 'ruralrise_production_session_secret_placeholder';
export const MIN_SESSION_SECRET_LENGTH = 32;

let ephemeralDevSecret: string | null = null;

/**
 * Validates and retrieves the SESSION_SECRET according to runtime environment rules.
 * Strict in production; non-blocking in development/preview.
 */
export function getSessionSecret(customEnv?: { NODE_ENV?: string; SESSION_SECRET?: string }): string {
  const nodeEnv = customEnv?.NODE_ENV !== undefined ? customEnv.NODE_ENV : (process.env.NODE_ENV || 'development');
  const secret = customEnv?.SESSION_SECRET !== undefined ? customEnv.SESSION_SECRET : (process.env.SESSION_SECRET || '');
  const isProd = nodeEnv === 'production';

  if (isProd) {
    if (!secret || secret.trim() === '') {
      throw new Error(
        'CRITICAL CONFIGURATION ERROR: SESSION_SECRET environment variable is strictly required in production.'
      );
    }

    if (secret === FORBIDDEN_SESSION_PLACEHOLDER || secret.toLowerCase().includes('placeholder')) {
      throw new Error(
        `CRITICAL CONFIGURATION ERROR: The default placeholder '${FORBIDDEN_SESSION_PLACEHOLDER}' cannot be used as a production secret. Please generate a unique high-entropy secret (at least 32 characters).`
      );
    }

    if (secret.length < MIN_SESSION_SECRET_LENGTH) {
      throw new Error(
        `CRITICAL CONFIGURATION ERROR: SESSION_SECRET is too short (${secret.length} characters). It must be at least ${MIN_SESSION_SECRET_LENGTH} characters long in production.`
      );
    }

    return secret;
  }

  // Development / Preview / Test handling
  if (secret && secret !== FORBIDDEN_SESSION_PLACEHOLDER && secret.length >= MIN_SESSION_SECRET_LENGTH) {
    return secret;
  }

  if (secret === FORBIDDEN_SESSION_PLACEHOLDER) {
    if (nodeEnv !== 'test') {
      console.warn(
        '[RuralRise Security Advisory] Using development placeholder SESSION_SECRET. A unique 32+ character secret is strictly required before deploying to production.'
      );
    }
    return secret;
  }

  // If secret not provided in development/preview: generate ephemeral secret for this process
  if (!ephemeralDevSecret) {
    ephemeralDevSecret = crypto.randomBytes(32).toString('hex');
    if (nodeEnv !== 'test') {
      console.info(
        '[RuralRise Config] SESSION_SECRET not provided in development. Generated an ephemeral development session secret.'
      );
    }
  }

  return ephemeralDevSecret;
}

/**
 * Validates whether Gemini API is configured with a real key
 */
export function isGeminiConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(key && key !== 'MY_GEMINI_API_KEY' && key.trim().length > 0);
}

/**
 * Resolves SQLite database path
 */
export function getDatabasePath(): string {
  if (process.env.DATABASE_PATH && process.env.DATABASE_PATH.trim() !== '') {
    return path.resolve(process.cwd(), process.env.DATABASE_PATH);
  }
  return path.resolve(process.cwd(), 'data', 'ruralrise.sqlite');
}
