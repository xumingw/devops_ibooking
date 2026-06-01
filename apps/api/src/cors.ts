import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export const DEFAULT_CORS_ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
  'http://127.0.0.1:5176'
] as const;

const CORS_ALLOWED_ORIGINS_ENV = 'CORS_ALLOWED_ORIGINS';

function normalizeCorsOrigin(origin: string): string {
  const trimmed = origin.trim();
  if (!trimmed) return '';

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error('unsupported protocol');
    }
    return parsed.origin;
  } catch {
    throw new Error(`${CORS_ALLOWED_ORIGINS_ENV} contains an invalid origin: ${origin}`);
  }
}

export function parseAllowedCorsOrigins(config = process.env.CORS_ALLOWED_ORIGINS): string[] {
  const configuredOrigins = config
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (!configuredOrigins?.length) {
    return [...DEFAULT_CORS_ALLOWED_ORIGINS];
  }

  return Array.from(new Set(configuredOrigins.map(normalizeCorsOrigin)));
}

export function isCorsOriginAllowed(
  requestOrigin: string | undefined,
  allowedOrigins: readonly string[]
): boolean {
  if (!requestOrigin) return true;

  try {
    return allowedOrigins.includes(normalizeCorsOrigin(requestOrigin));
  } catch {
    return false;
  }
}

export function createCorsOptions(config = process.env.CORS_ALLOWED_ORIGINS): CorsOptions {
  const allowedOrigins = parseAllowedCorsOrigins(config);

  return {
    origin: (requestOrigin, callback) => {
      if (!requestOrigin) {
        callback(null, true);
        return;
      }

      const normalizedOrigin = isCorsOriginAllowed(requestOrigin, allowedOrigins)
        ? normalizeCorsOrigin(requestOrigin)
        : false;
      callback(null, normalizedOrigin);
    },
    credentials: true
  };
}
