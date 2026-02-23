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
});
