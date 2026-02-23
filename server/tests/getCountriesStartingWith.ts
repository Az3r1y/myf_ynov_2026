import axios from "axios";

const COUNTRIES_URL = "https://api.first.org/data/v1/countries?limit=1000";

type CountryApiEntry = {
  country: string;
};

type CountriesApiResponse = {
  data?: Record<string, CountryApiEntry>;
};

export async function getCountriesStartingWith(srch: string): Promise<string[]> {
  const normalizedSearch = srch.trim().toLowerCase();
  if (!normalizedSearch) {
    return [];
  }

  const response = await axios.get<CountriesApiResponse>(COUNTRIES_URL);
  const allCountries = Object.values(response.data?.data ?? {}).map(
    (entry) => entry.country,
  );

  return allCountries.filter((country) =>
    country.toLowerCase().startsWith(normalizedSearch),
  );
}
