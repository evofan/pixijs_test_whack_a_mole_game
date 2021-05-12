/**
 * Returns a random value.
 * @param min
 * @param max
 * @returns Above the minimum value and below the maximum value.
 */
export const randomInt: Function = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
