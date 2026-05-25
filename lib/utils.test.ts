import { formatNaira, koboFromNaira, nairaFromKobo, generateRef, timeAgo } from "./utils";

describe("formatNaira", () => {
  it("formats kobo to naira string", () => {
    expect(formatNaira(350000)).toBe("₦3,500");
    expect(formatNaira(100)).toBe("₦1");
    expect(formatNaira(100000)).toBe("₦1,000");
  });
});

describe("koboFromNaira", () => {
  it("converts naira to kobo", () => {
    expect(koboFromNaira(3500)).toBe(350000);
    expect(koboFromNaira(1)).toBe(100);
    expect(koboFromNaira(0)).toBe(0);
  });
});

describe("nairaFromKobo", () => {
  it("converts kobo to naira", () => {
    expect(nairaFromKobo(350000)).toBe(3500);
    expect(nairaFromKobo(100)).toBe(1);
  });
});

describe("generateRef", () => {
  it("generates a unique reference", () => {
    const ref1 = generateRef();
    const ref2 = generateRef();
    expect(ref1).toMatch(/^DNG-/);
    expect(ref1).not.toBe(ref2);
  });
});

describe("timeAgo", () => {
  it("returns just now for recent dates", () => {
    expect(timeAgo(new Date())).toBe("just now");
  });

  it("returns minutes for recent dates", () => {
    const d = new Date(Date.now() - 2 * 60 * 1000);
    expect(timeAgo(d)).toBe("2m ago");
  });
});
