import { filter, map } from "./arrayUtils";

describe("array helpers", () => {
  test("map calls callback the correct number of times with correct parameters", () => {
    const spy = jest.fn((value: number) => value * 10);

    const result = map([1, 2, 3], spy);

    expect(result).toEqual([10, 20, 30]);
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy).toHaveBeenNthCalledWith(1, 1);
    expect(spy).toHaveBeenNthCalledWith(2, 2);
    expect(spy).toHaveBeenNthCalledWith(3, 3);
  });

  test("filter keeps only items matching the callback result", () => {
    const spy = jest.fn((value: number) => value % 2 === 0);

    const result = filter([1, 2, 3, 4], spy);

    expect(result).toEqual([2, 4]);
    expect(spy).toHaveBeenCalledTimes(4);
    expect(spy).toHaveBeenNthCalledWith(1, 1);
    expect(spy).toHaveBeenNthCalledWith(2, 2);
    expect(spy).toHaveBeenNthCalledWith(3, 3);
    expect(spy).toHaveBeenNthCalledWith(4, 4);
  });
});
