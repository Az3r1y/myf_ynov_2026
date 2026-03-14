import axios from "axios";
import { getCoordinatesFromSearch } from "../src/utils/getCoordinatesFromSearch";

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("getCoordinatesFromSearch", () => {
  test("returns coordinates when the API returns a valid feature", async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        features: [{ geometry: { coordinates: [2.3522, 48.8566] } }],
      },
    });

    const result = await getCoordinatesFromSearch("Paris");

    expect(result).toEqual({ lng: 2.3522, lat: 48.8566 });
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });

  test("returns null when the features array is empty", async () => {
    mockedAxios.get.mockResolvedValue({ data: { features: [] } });

    const result = await getCoordinatesFromSearch("nowhere");

    expect(result).toBeNull();
  });

  test("returns null when the API call throws an error", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Network error"));

    const result = await getCoordinatesFromSearch("Paris");

    expect(result).toBeNull();
  });

  test("returns null when a feature has coordinates with wrong length", async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        features: [{ geometry: { coordinates: [2.3522] } }],
      },
    });

    const result = await getCoordinatesFromSearch("Paris");

    expect(result).toBeNull();
  });

  test("returns the first valid feature when multiple features are returned", async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        features: [
          { geometry: { coordinates: [4.8357, 45.764] } },
          { geometry: { coordinates: [2.3522, 48.8566] } },
        ],
      },
    });

    const result = await getCoordinatesFromSearch("Lyon");

    expect(result).toEqual({ lng: 4.8357, lat: 45.764 });
  });

  test("returns null when data has no features property", async () => {
    mockedAxios.get.mockResolvedValue({ data: {} });

    const result = await getCoordinatesFromSearch("Paris");

    expect(result).toBeNull();
  });
});
