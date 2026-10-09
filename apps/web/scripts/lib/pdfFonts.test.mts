import { describe, expect, it } from "vitest";

import { sanitizeForPdf } from "./pdfFonts.mjs";

describe("sanitizeForPdf", () => {
  it("leaves plain ASCII and Latin-1 Supplement characters untouched", () => {
    expect(sanitizeForPdf("A café has 90° angles; 8² = 64, ½ credit, 5 × 4 ÷ 2.")).toBe(
      "A café has 90° angles; 8² = 64, ½ credit, 5 × 4 ÷ 2."
    );
  });

  it("substitutes the already-shipped set (₹/π/√/≈/≠/≤/≥/∞)", () => {
    expect(sanitizeForPdf("₹500, π ≈ 3.14, √16, ≤20%, ≥10%, ∞, ≠4")).toBe(
      "Rs. 500, pi ~= 3.14, sqrt 16, <=20%, >=10%, infinity, !=4"
    );
  });

  it("substitutes arrows and the Unicode minus sign", () => {
    expect(sanitizeForPdf("A → B, A ↔ Z, 20 − 2 = 18")).toBe("A -> B, A <-> Z, 20 - 2 = 18");
  });

  it("substitutes check/cross marks and the angle/cube-root/fraction symbols", () => {
    expect(sanitizeForPdf("8 ✓, 9 ✗, ∠AEF = 50°, ∛216, 33⅓%, 66⅔%")).toBe(
      "8  (correct), 9  (incorrect), angle AEF = 50°, cbrt 216, 331/3%, 662/3%"
    );
  });

  it("substitutes set-theory, geometry-relation, and Greek-letter variable names", () => {
    expect(sanitizeForPdf("A ∩ B, A ∪ B, A ⊆ B, A ⊂ B, x ∈ A, ∅, AB ∥ CD, AB ⊥ CD, x ∝ y, AB ≅ CD, θ, λ, μ, α, β, η, Δ")).toBe(
      "A  intersection  B, A  union  B, A  subset-or-equal-to  B, A  subset-of  B, x  is-an-element-of  A, the empty set, AB  parallel-to  CD, AB  perpendicular-to  CD, x  proportional-to  y, AB  congruent-to  CD, theta, lambda, mu, alpha, beta, eta, delta"
    );
  });

  it("collapses superscript runs to an ASCII ^(...) marker, keeping literal ¹²³ untouched", () => {
    expect(sanitizeForPdf("aᵏ×aⁿ=aᵏ⁺ⁿ")).toBe("a^(k)×a^(n)=a^(k+n)");
    // ⁻¹ groups as one run with the literal-safe ¹ so it doesn't split into "^(-)" + a stray "¹"
    expect(sanitizeForPdf("4⁻¹")).toBe("4^(-1)");
    // a run made entirely of ¹/²/³ is already Latin-1-safe and left as a literal superscript
    expect(sanitizeForPdf("8² and 5³ and 1¹")).toBe("8² and 5³ and 1¹");
  });

  it("collapses subscript runs to plain ASCII digits with no marker", () => {
    expect(sanitizeForPdf("H₂SO₄ + Na₂CO₃")).toBe("H2SO4 + Na2CO3");
    // θᵢ/θᵣ (angle of incidence/reflection) use Latin Subscript Modifier Letters
    // (U+1D62/U+1D63) — visually close to, but a different codepoint from,
    // the superscript modifier letters handled above. Caught by a full
    // corpus scan after the first version of this fix mapped the wrong one.
    expect(sanitizeForPdf("θᵢ equals θᵣ")).toBe("thetai equals thetar");
    expect(sanitizeForPdf("SP₁ and SP₂")).toBe("SP1 and SP2");
  });

  it("handles the real chained chemistry-equation shape with an arrow and a gas-evolution marker", () => {
    expect(sanitizeForPdf("H₂SO₄ + Na₂CO₃ → Na₂SO₄ + H₂O + CO₂↑")).toBe(
      "H2SO4 + Na2CO3 -> Na2SO4 + H2O + CO2 (gas released)"
    );
  });
});
