import { apiFetchPublic } from "@/lib/api";

export type PublicBookingLocation = {
  id: string;
  name: string;
};

export type PublicBookingPackage = {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  maxCapacity: number;
};

export type PublicBookingStudio = {
  id: string;
  name: string;
  type: string;
  capacity: number;
  locationId?: string;
};

export type PublicBookingAddOn = {
  id: string;
  name: string;
  price: number;
};

export type PublicBookingSlot = {
  scheduleId: string;
  studioId: string;
  studioName: string;
  studioType: string;
  startTime: string;
  endTime: string;
  status: "available" | "unavailable";
  reason: string | null;
};

export type PublicBookingMetaData = {
  locations: PublicBookingLocation[];
  studios: PublicBookingStudio[];
  packages: PublicBookingPackage[];
  addOns?: PublicBookingAddOn[];
};

export type PublicBookingAvailabilityData = {
  location: PublicBookingLocation;
  date: string;
  package: PublicBookingPackage;
  studioType: string | null;
  studios: PublicBookingStudio[];
  slots: PublicBookingSlot[];
  availableSlots: PublicBookingSlot[];
};

type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

const memoryCache = new Map<string, CacheEntry<unknown>>();
const inFlight = new Map<string, Promise<unknown>>();
const META_CACHE_KEY = "photoscape:booking:meta:v1";
const META_TTL_MS = 5 * 60 * 1000;
const AVAILABILITY_TTL_MS = 90 * 1000;

function getNow() {
  return Date.now();
}

function readCache<T>(key: string): T | null {
  const memoryHit = memoryCache.get(key);
  if (memoryHit && memoryHit.expiresAt > getNow()) {
    return memoryHit.value as T;
  }

  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(key);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as CacheEntry<T>;
    if (parsed.expiresAt <= getNow()) {
      window.sessionStorage.removeItem(key);
      return null;
    }

    memoryCache.set(key, parsed as CacheEntry<unknown>);
    return parsed.value;
  } catch {
    window.sessionStorage.removeItem(key);
    return null;
  }
}

function writeCache<T>(key: string, value: T, ttlMs: number) {
  const entry: CacheEntry<T> = {
    value,
    expiresAt: getNow() + ttlMs,
  };

  memoryCache.set(key, entry as CacheEntry<unknown>);

  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(key, JSON.stringify(entry));
  }
}

function withInFlightDedup<T>(key: string, loader: () => Promise<T>) {
  const pending = inFlight.get(key);
  if (pending) {
    return pending as Promise<T>;
  }

  const request = loader().finally(() => {
    inFlight.delete(key);
  });

  inFlight.set(key, request as Promise<unknown>);
  return request;
}

function buildAvailabilityKey(params: {
  locationId: string;
  packageId: string;
  studioType: string;
  date: string;
}) {
  return `photoscape:booking:availability:v1:${params.locationId}:${params.packageId}:${params.studioType}:${params.date}`;
}

export async function fetchPublicBookingMeta() {
  const cached = readCache<PublicBookingMetaData>(META_CACHE_KEY);
  if (cached) return cached;

  return withInFlightDedup(META_CACHE_KEY, async () => {
    const json = await apiFetchPublic<{ data?: PublicBookingMetaData }>("/api/bookings/meta");
    const data: PublicBookingMetaData = {
      locations: json.data?.locations ?? [],
      studios: json.data?.studios ?? [],
      packages: json.data?.packages ?? [],
      addOns: json.data?.addOns ?? [],
    };

    writeCache(META_CACHE_KEY, data, META_TTL_MS);
    return data;
  });
}

export async function fetchPublicBookingAvailability(params: {
  locationId: string;
  packageId: string;
  studioType: string;
  date: string;
}) {
  const cacheKey = buildAvailabilityKey(params);
  const cached = readCache<PublicBookingAvailabilityData>(cacheKey);
  if (cached) return cached;

  return withInFlightDedup(cacheKey, async () => {
    const query = new URLSearchParams({
      locationId: params.locationId,
      packageId: params.packageId,
      studioType: params.studioType,
      date: params.date,
    });

    const json = await apiFetchPublic<{ data?: PublicBookingAvailabilityData }>(
      `/api/bookings/availability?${query.toString()}`
    );

    const data: PublicBookingAvailabilityData = {
      location: json.data?.location as PublicBookingLocation,
      date: json.data?.date ?? params.date,
      package: json.data?.package as PublicBookingPackage,
      studioType: json.data?.studioType ?? params.studioType,
      studios: json.data?.studios ?? [],
      slots: json.data?.slots ?? [],
      availableSlots: json.data?.availableSlots ?? [],
    };

    writeCache(cacheKey, data, AVAILABILITY_TTL_MS);
    return data;
  });
}
