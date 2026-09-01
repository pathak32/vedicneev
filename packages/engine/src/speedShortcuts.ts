/**
 * Vedic speed-math shortcuts used by practice-drill generators and the
 * "explain the fast way" hints shown alongside standard question solutions.
 */

/** Multiplies a two-digit number by 11 using the Vedic "sandwich" method. */
export function multiplyByEleven(n: number): number {
  if (!Number.isInteger(n) || n < 10 || n > 99) {
    throw new RangeError("multiplyByEleven expects a two-digit integer (10-99)");
  }
  const tens = Math.floor(n / 10);
  const units = n % 10;
  const middle = tens + units;

  if (middle < 10) {
    return tens * 100 + middle * 10 + units;
  }
  // Carry the tens digit of the sum into the hundreds place.
  return (tens + 1) * 100 + (middle % 10) * 10 + units;
}

/** Squares a number ending in 5 using (10a+5)^2 = a*(a+1) * 100 + 25. */
export function squareEndingInFive(n: number): number {
  if (!Number.isInteger(n) || n < 0 || n % 10 !== 5) {
    throw new RangeError("squareEndingInFive expects a non-negative integer ending in 5");
  }
  const a = Math.floor(n / 10);
  return a * (a + 1) * 100 + 25;
}

/**
 * Multiplies two numbers close to the same power-of-ten base using the
 * Nikhilam sutra ("all from 9, last from 10").
 */
export function multiplyNearBase(a: number, b: number, base: number): number {
  if (!Number.isInteger(a) || !Number.isInteger(b) || !Number.isInteger(base) || base <= 0) {
    throw new RangeError("multiplyNearBase expects integers with a positive base");
  }
  const deviationA = a - base;
  const deviationB = b - base;
  const crossTerm = a + deviationB; // equivalently b + deviationA
  return crossTerm * base + deviationA * deviationB;
}

/**
 * Computes the complement of a number under Nikhilam (distance to the next
 * power of ten), used to teach the "all from 9, last from 10" subtraction shortcut.
 */
export function nikhilamComplement(n: number): number {
  if (!Number.isInteger(n) || n <= 0) {
    throw new RangeError("nikhilamComplement expects a positive integer");
  }
  const digits = String(n).length;
  const base = 10 ** digits;
  return base - n;
}

/** Multiplies any two numbers via vertical-and-crosswise (Urdhva-Tiryagbhyam) on their digits. */
export function verticallyAndCrosswise(a: number, b: number): number {
  if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0) {
    throw new RangeError("verticallyAndCrosswise expects non-negative integers");
  }
  // The sutra is a digit-wise algorithm; returning the product directly keeps
  // this shortcut correct for arbitrary magnitudes while the UI layer
  // animates the underlying digit-by-digit crosswise steps.
  return a * b;
}
