import { describe, expect, it } from "vitest";

import { isCrossOrigin, resolveSafeNext } from "./crossDomainRedirect";

const ORIGIN = "https://vedicneev.com";

describe("resolveSafeNext", () => {
  it("passes through a relative path unchanged", () => {
    expect(resolveSafeNext("/dashboard", ORIGIN)).toBe("/dashboard");
  });

  it("passes through an allowed subdomain", () => {
    expect(resolveSafeNext("https://typingtest.vedicneev.com/dashboard", ORIGIN)).toBe(
      "https://typingtest.vedicneev.com/dashboard"
    );
  });

  it("passes through the apex domain itself", () => {
    expect(resolveSafeNext("https://vedicneev.com/parent", ORIGIN)).toBe("https://vedicneev.com/parent");
  });

  it("allows localhost for cross-app local dev", () => {
    expect(resolveSafeNext("http://localhost:3002/dashboard", ORIGIN)).toBe("http://localhost:3002/dashboard");
  });

  it("rejects an unrelated external host", () => {
    expect(resolveSafeNext("https://evil.example/phish", ORIGIN)).toBe("/dashboard");
  });

  it("rejects a lookalike host that merely contains the domain as a suffix trick", () => {
    expect(resolveSafeNext("https://vedicneev.com.evil.example", ORIGIN)).toBe("/dashboard");
  });

  it("rejects a lookalike host with no separating dot", () => {
    expect(resolveSafeNext("https://notvedicneev.com", ORIGIN)).toBe("/dashboard");
  });

  it("rejects a non-http(s) scheme", () => {
    expect(resolveSafeNext("javascript:alert(1)", ORIGIN)).toBe("/dashboard");
  });

  it("falls back to the default when next is empty", () => {
    expect(resolveSafeNext(null, ORIGIN)).toBe("/dashboard");
    expect(resolveSafeNext("", ORIGIN)).toBe("/dashboard");
  });
});

describe("isCrossOrigin", () => {
  it("is false for a relative path", () => {
    expect(isCrossOrigin("/dashboard", ORIGIN)).toBe(false);
  });

  it("is true for an allowed subdomain", () => {
    expect(isCrossOrigin("https://typingtest.vedicneev.com/dashboard", ORIGIN)).toBe(true);
  });

  it("is false for the same origin given as an absolute URL", () => {
    expect(isCrossOrigin("https://vedicneev.com/dashboard", ORIGIN)).toBe(false);
  });
});
