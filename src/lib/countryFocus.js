export const COUNTRY_FOCUS_OPTIONS = [
  {
    key: "taiwan",
    label: "Taiwan",
    localLabel: "台灣",
    city: "Taipei",
    country: "Taiwan",
    lat: 23.75,
    lng: 120.95,
    globeHeight: 1800000,
    mapZoom: 8,
    aliases: ["tw", "taipei", "台灣", "台湾", "台北"],
  },
  {
    key: "japan",
    label: "Japan",
    localLabel: "日本",
    city: "Tokyo",
    country: "Japan",
    lat: 36.2048,
    lng: 138.2529,
    globeHeight: 2500000,
    mapZoom: 6,
    aliases: ["jp", "tokyo", "日本", "東京", "东京"],
  },
  {
    key: "usa",
    label: "USA",
    localLabel: "美國",
    city: "United States",
    country: "United States",
    lat: 39.8283,
    lng: -98.5795,
    globeHeight: 5200000,
    mapZoom: 4,
    aliases: ["us", "u.s.", "u.s.a.", "america", "united states", "美國", "美国"],
  },
  {
    key: "korea",
    label: "Korea",
    localLabel: "韓國",
    city: "Seoul",
    country: "South Korea",
    lat: 36.5,
    lng: 127.8,
    globeHeight: 1700000,
    mapZoom: 7,
    aliases: ["kr", "south korea", "seoul", "韓國", "韩国", "首爾", "首尔"],
  },
  {
    key: "singapore",
    label: "Singapore",
    localLabel: "新加坡",
    city: "Singapore",
    country: "Singapore",
    lat: 1.3521,
    lng: 103.8198,
    globeHeight: 950000,
    mapZoom: 11,
    aliases: ["sg", "新加坡"],
  },
  {
    key: "hong-kong",
    label: "Hong Kong",
    localLabel: "香港",
    city: "Hong Kong",
    country: "Hong Kong",
    lat: 22.3193,
    lng: 114.1694,
    globeHeight: 900000,
    mapZoom: 10,
    aliases: ["hk", "香港"],
  },
  {
    key: "uk",
    label: "United Kingdom",
    localLabel: "英國",
    city: "London",
    country: "United Kingdom",
    lat: 54.5,
    lng: -3.4,
    globeHeight: 2600000,
    mapZoom: 6,
    aliases: ["uk", "britain", "england", "london", "英國", "英国", "倫敦", "伦敦"],
  },
  {
    key: "canada",
    label: "Canada",
    localLabel: "加拿大",
    city: "Canada",
    country: "Canada",
    lat: 56.1304,
    lng: -106.3468,
    globeHeight: 6200000,
    mapZoom: 4,
    aliases: ["ca", "加拿大"],
  },
  {
    key: "australia",
    label: "Australia",
    localLabel: "澳洲",
    city: "Australia",
    country: "Australia",
    lat: -25.2744,
    lng: 133.7751,
    globeHeight: 4300000,
    mapZoom: 4,
    aliases: ["au", "aussie", "澳洲", "澳大利亞", "澳大利亚"],
  },
];

export const HOT_COUNTRY_KEYS = ["taiwan", "japan", "usa", "korea"];

export const HOT_COUNTRY_OPTIONS = HOT_COUNTRY_KEYS.map((key) =>
  COUNTRY_FOCUS_OPTIONS.find((country) => country.key === key)
).filter(Boolean);

function normalizeCountryQuery(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[.,]/g, "")
    .replace(/\s+/g, " ");
}

export function findCountryFocus(value) {
  const query = normalizeCountryQuery(value);
  if (!query) return null;

  return (
    COUNTRY_FOCUS_OPTIONS.find((country) => {
      const names = [
        country.key,
        country.label,
        country.localLabel,
        country.city,
        country.country,
        ...(country.aliases || []),
      ];
      return names.some((name) => normalizeCountryQuery(name) === query);
    }) ||
    COUNTRY_FOCUS_OPTIONS.find((country) => {
      const names = [
        country.label,
        country.localLabel,
        country.country,
        ...(country.aliases || []),
      ];
      return names.some((name) => normalizeCountryQuery(name).includes(query));
    })
  );
}

export function countryToLocationPayload(country) {
  if (!country) return null;

  return {
    locationKey: country.key,
    locationCity: country.city,
    locationCountry: country.country,
    locationLat: Number(country.lat).toFixed(6),
    locationLng: Number(country.lng).toFixed(6),
  };
}
