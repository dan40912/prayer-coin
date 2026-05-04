export const PRAYER_LOCATION_OPTIONS = [
  { city: "台北", country: "台灣", lat: 25.033, lng: 121.5654 },
  { city: "台中", country: "台灣", lat: 24.1477, lng: 120.6736 },
  { city: "高雄", country: "台灣", lat: 22.6273, lng: 120.3014 },
  { city: "香港", country: "香港", lat: 22.3193, lng: 114.1694 },
  { city: "東京", country: "日本", lat: 35.6762, lng: 139.6503 },
  { city: "首爾", country: "韓國", lat: 37.5665, lng: 126.978 },
  { city: "新加坡", country: "新加坡", lat: 1.3521, lng: 103.8198 },
  { city: "曼谷", country: "泰國", lat: 13.7563, lng: 100.5018 },
  { city: "馬尼拉", country: "菲律賓", lat: 14.5995, lng: 120.9842 },
  { city: "雪梨", country: "澳洲", lat: -33.8688, lng: 151.2093 },
  { city: "洛杉磯", country: "美國", lat: 34.0522, lng: -118.2437 },
  { city: "紐約", country: "美國", lat: 40.7128, lng: -74.006 },
  { city: "溫哥華", country: "加拿大", lat: 49.2827, lng: -123.1207 },
  { city: "多倫多", country: "加拿大", lat: 43.6532, lng: -79.3832 },
  { city: "倫敦", country: "英國", lat: 51.5072, lng: -0.1276 },
  { city: "巴黎", country: "法國", lat: 48.8566, lng: 2.3522 },
  { city: "柏林", country: "德國", lat: 52.52, lng: 13.405 },
  { city: "杜拜", country: "阿聯酋", lat: 25.2048, lng: 55.2708 },
  { city: "耶路撒冷", country: "以色列", lat: 31.7683, lng: 35.2137 },
  { city: "開普敦", country: "南非", lat: -33.9249, lng: 18.4241 },
];

function normalizeLocationText(value, maxLength = 120) {
  const text = String(value ?? "").trim();
  return text ? text.slice(0, maxLength) : "";
}

function parseCoordinate(value) {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function assertCoordinateRange(lat, lng) {
  if (lat === null || lng === null) {
    throw new Error("請完整填寫城市名稱、緯度與經度，或改選預設城市。");
  }
  if (lat < -90 || lat > 90) {
    throw new Error("緯度必須介於 -90 到 90。");
  }
  if (lng < -180 || lng > 180) {
    throw new Error("經度必須介於 -180 到 180。");
  }
}

export function buildPrayerLocationLabel(location) {
  if (!location?.city) return "";
  return location.country ? `${location.city}, ${location.country}` : location.city;
}

export function findPrayerLocation(value) {
  const normalized = String(value ?? "").trim();
  if (!normalized) return null;

  return (
    PRAYER_LOCATION_OPTIONS.find((location) => {
      const label = buildPrayerLocationLabel(location);
      return normalized === label || normalized === location.city;
    }) ?? null
  );
}

export function sanitizePrayerLocationPayload(body = {}) {
  const customCity = normalizeLocationText(body.locationCity);
  const customCountry = normalizeLocationText(body.locationCountry);
  const customLat = parseCoordinate(body.locationLat);
  const customLng = parseCoordinate(body.locationLng);
  const hasCustomLocation =
    Boolean(customCity || customCountry) || customLat !== null || customLng !== null;

  if (hasCustomLocation) {
    if (!customCity) {
      throw new Error("請填寫城市名稱，或清空經緯度改選預設城市。");
    }
    assertCoordinateRange(customLat, customLng);

    return {
      locationCity: customCity,
      locationCountry: customCountry || null,
      locationLat: Number(customLat.toFixed(6)),
      locationLng: Number(customLng.toFixed(6)),
    };
  }

  const requested = body.locationKey ?? body.locationLabel ?? "";
  const matched = findPrayerLocation(requested);

  if (!matched) {
    return {
      locationCity: null,
      locationCountry: null,
      locationLat: null,
      locationLng: null,
    };
  }

  return {
    locationCity: matched.city,
    locationCountry: matched.country,
    locationLat: matched.lat,
    locationLng: matched.lng,
  };
}

export function hasPrayerLocation(card) {
  return Boolean(
    card?.locationCity &&
    Number.isFinite(Number(card.locationLat)) &&
    Number.isFinite(Number(card.locationLng))
  );
}
