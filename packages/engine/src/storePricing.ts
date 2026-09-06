/**
 * Pure pricing math for the storefront checkout — computing a promo
 * code's discount on a product's sellingPrice. No I/O; the caller (the
 * checkout route) is responsible for looking up the actual Product/
 * PromoCode rows and validating the code is active.
 */

export type PromoDiscountType = "PERCENTAGE" | "FIXED";

export interface PromoCodeConfig {
  discountType: PromoDiscountType;
  discountValue: number;
}

/** Applies a promo code to a base price, clamped to never go below 0 or above the base price. */
export function applyPromoDiscount(basePrice: number, promo: PromoCodeConfig | null): number {
  if (!promo) return basePrice;

  const discount =
    promo.discountType === "PERCENTAGE" ? basePrice * (promo.discountValue / 100) : promo.discountValue;

  return Math.max(0, Math.round((basePrice - Math.min(discount, basePrice)) * 100) / 100);
}
