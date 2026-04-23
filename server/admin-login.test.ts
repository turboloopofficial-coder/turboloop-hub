import { describe, it, expect } from "vitest";

describe("admin login", () => {
  it("should have ADMIN_EMAIL env set", () => {
    expect(process.env.ADMIN_EMAIL).toBeDefined();
    expect(process.env.ADMIN_EMAIL).toContain("@");
  });

  it("should have ADMIN_PASSWORD env set", () => {
    expect(process.env.ADMIN_PASSWORD).toBeDefined();
    expect(process.env.ADMIN_PASSWORD!.length).toBeGreaterThan(5);
  });
});
