/**
 * Legal launch settings — one place for values the legal checks depend on.
 */

/** Minimum age to create an account. Raise to 16 for EU audiences. */
export const MIN_AGE = 13;

/** sessionStorage key that keeps an under-age refusal sticky for the session. */
export const AGE_REFUSED_KEY = 'age_refused';

/**
 * Birth year only → assume the youngest age the person could be
 * (currentYear - birthYear - 1). Returns null for an invalid year.
 */
export function isUnderAge(birthYear: number, now = new Date()): boolean | null {
  const year = now.getFullYear();
  if (!Number.isInteger(birthYear) || birthYear < 1900 || birthYear > year) return null;
  return year - birthYear - 1 < MIN_AGE;
}
