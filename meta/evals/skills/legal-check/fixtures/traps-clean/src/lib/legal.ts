export const MIN_AGE = 13;
export function isUnderAge(birthYear: number) { return new Date().getFullYear() - birthYear - 1 < MIN_AGE; }
