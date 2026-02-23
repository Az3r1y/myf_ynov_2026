import axios from "axios";
import { getCountriesStartingWith } from "./getCountriesStartingWith";

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("getCountriesStartingWith", () => {
  const countriesEndpoint = "https://api.first.org/data/v1/countries?limit=1000";

  test("returns countries matching prefix and calls external API once", async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        data: {
          FR: { country: "France" },
          FI: { country: "Finland" },
          DE: { country: "Germany" },
        },
      },
    });

    const result = await getCountriesStartingWith("f");

    expect(result).toEqual(["France", "Finland"]);
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    expect(mockedAxios.get).toHaveBeenCalledWith(countriesEndpoint);
  });

  test("returns an empty array if search is empty", async () => {
    const result = await getCountriesStartingWith("   ");

    expect(result).toEqual([]);
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });
});
