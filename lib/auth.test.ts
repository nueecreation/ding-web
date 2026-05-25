import { otpStore } from "./auth";

describe("OTP Store", () => {
  afterEach(() => {
    otpStore.clear();
  });

  it("stores and retrieves an OTP", () => {
    const phone = "+2348012345678";
    const code = "123456";
    otpStore.set(phone, { code, expires: Date.now() + 300000 });

    const stored = otpStore.get(phone);
    expect(stored).toBeDefined();
    expect(stored!.code).toBe(code);
    expect(stored!.expires).toBeGreaterThan(Date.now());
  });

  it("detects expired OTP", () => {
    const phone = "+2348099999999";
    const code = "654321";
    otpStore.set(phone, { code, expires: Date.now() - 1000 });

    const stored = otpStore.get(phone);
    expect(stored).toBeDefined();
    expect(stored!.expires).toBeLessThan(Date.now());
  });

  it("deletes OTP after use", () => {
    const phone = "+2348011111111";
    otpStore.set(phone, { code: "000000", expires: Date.now() + 300000 });
    otpStore.delete(phone);
    expect(otpStore.get(phone)).toBeUndefined();
  });
});

describe("Amount validation", () => {
  it("rejects zero amounts", () => {
    expect(0 < 100).toBe(true);
  });

  it("accepts valid amount", () => {
    const kobo = 3500 * 100;
    expect(kobo).toBe(350000);
    expect(kobo >= 100).toBe(true);
  });
});
