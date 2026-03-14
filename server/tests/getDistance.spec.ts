import { getDistance } from "../src/utils/getDistance";

describe("getDistance", () => {
  test("returns 0 for identical coordinates", () => {
    const point = { lat: 45.764, lng: 4.8357 };

    const distance = getDistance(point, point);

    expect(distance).toBe(0);
  });

  test("returns approximately the distance between Lyon and Paris", () => {
    const lyon = { lat: 45.764, lng: 4.8357 };
    const paris = { lat: 48.8566, lng: 2.3522 };

    const distance = getDistance(lyon, paris);

    expect(distance).toBeGreaterThan(380);
    expect(distance).toBeLessThan(410);
  });

  test("returns a positive value for two different points", () => {
    const bordeaux = { lat: 44.8378, lng: -0.5792 };
    const nice = { lat: 43.7102, lng: 7.262 };

    const distance = getDistance(bordeaux, nice);

    expect(distance).toBeGreaterThan(0);
  });

  test("is symmetric — distance(A, B) equals distance(B, A)", () => {
    const lyon = { lat: 45.764, lng: 4.8357 };
    const marseille = { lat: 43.2965, lng: 5.3698 };

    expect(getDistance(lyon, marseille)).toBeCloseTo(
      getDistance(marseille, lyon),
      5,
    );
  });

  test("returns approximately the distance between Lyon and Marseille", () => {
    const lyon = { lat: 45.764, lng: 4.8357 };
    const marseille = { lat: 43.2965, lng: 5.3698 };

    const distance = getDistance(lyon, marseille);

    expect(distance).toBeGreaterThan(270);
    expect(distance).toBeLessThan(310);
  });
});
