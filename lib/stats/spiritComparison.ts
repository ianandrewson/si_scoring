/**
 * Spirit comparison utilities for game statistics.
 * Provides order-agnostic spirit array comparison and key generation.
 */

/**
 * Compares two spirit arrays for equality, ignoring order.
 * @param spirits1 First array of spirit names
 * @param spirits2 Second array of spirit names
 * @returns true if both arrays contain the same spirits (order-agnostic)
 */
export const areSpiritsSame = (spirits1: string[], spirits2: string[]): boolean => {
  if (spirits1.length !== spirits2.length) return false;
  const sorted1 = [...spirits1].sort();
  const sorted2 = [...spirits2].sort();
  return sorted1.every((spirit, index) => spirit === sorted2[index]);
};

/**
 * Generates a sorted key string from a spirit array for grouping/matching.
 * @param spirits Array of spirit names
 * @returns Sorted, comma-separated string of spirit names
 */
export const getSpiritComboKey = (spirits: string[]): string => {
  return [...spirits].sort().join(',');
};
