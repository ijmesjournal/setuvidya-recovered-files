import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { PRODUCTION_ORIGIN } from './deployment-policy.mjs';

/** Merge conditional class names, with Tailwind conflict resolution. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Approved canonical origin; preview host/environment overrides cannot replace it. */
export const siteUrl = PRODUCTION_ORIGIN;

export function absoluteUrl(path = '/') {
  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
}
