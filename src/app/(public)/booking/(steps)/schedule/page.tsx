"use client";

import Footer from "@/utility/footer";
import NavigationBar from "@/utility/navbar";
import { Montserrat } from "next/font/google";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import { IoIosArrowRoundForward } from "react-icons/io";

const monserratFont = Montserrat({
  subsets: ["latin"],
  weight: "500",
});

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
const AUTO_JUMP_SEARCH_DAYS = 30;

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

type Location = {
  id: string;
  name: string;
};

type BookingPackage = {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  maxCapacity: number;
};

type Studio = {
  id: string;
  name: string;
  type: string;
  capacity: number;
};

type Slot = {
  scheduleId: string;
  studioId: string;
  studioName: string;
  studioType: string;
  startTime: string;
  endTime: string;
  status: "available" | "unavailable";
  reason: string | null;
};

type BookingMetaResponse = {
  data: {
    locations: Location[];
    studios: Studio[];
    packages: BookingPackage[];
  };
};

type AvailabilityResponse = {
  data: {
    location: Location;
    date: string;
    package: BookingPackage;
    studioType: string | null;
    studios: Studio[];
    slots: Slot[];
    availableSlots: Slot[];
  };
};

function toDateOnlyString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatHour(iso: string) {
  const date = new Date(iso);
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  return `${hours}.${minutes}`;
}

function buildCalendarCells(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const cells: Array<number | null> = Array.from({ length: firstDay }, () => null);
  for (let day = 1; day <= totalDays; day += 1) {
    cells.push(day);
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

export default function SchedulePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const incomingCity = searchParams.get("city") || "";
  const incomingAddOns = searchParams.get("addOns") || "";
  const incomingCustomerName = searchParams.get("customerName") || "";
  const incomingCustomerPhone = searchParams.get("customerPhone") || "";

  const [metaLoading, setMetaLoading] = useState(true);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [locations, setLocations] = useState<Location[]>([]);
  const [packages, setPackages] = useState<BookingPackage[]>([]);
  const [studios, setStudios] = useState<Studio[]>([]);

  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [selectedStudioType, setSelectedStudioType] = useState("");

  const [monthCursor, setMonthCursor] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState("");

  const selectedSlot = useMemo(
    () => slots.find(slot => slot.scheduleId === selectedSlotId) ?? null,
    [slots, selectedSlotId]
  );

  const selectedStudioName = useMemo(() => {
    if (selectedSlot) return selectedSlot.studioName;
    const matching = studios.find(studio => studio.type === selectedStudioType);
    return matching?.name ?? "Studio";
  }, [selectedSlot, studios, selectedStudioType]);

  const calendarCells = useMemo(() => buildCalendarCells(monthCursor), [monthCursor]);

  useEffect(() => {
    const controller = new AbortController();

    const loadMeta = async () => {
      setMetaLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/bookings/meta`, {
          method: "GET",
          signal: controller.signal,
        });

        const json = (await response.json()) as BookingMetaResponse;

        if (!response.ok) {
          throw new Error((json as any)?.message || "Gagal memuat data booking");
        }

        const fetchedLocations = json.data.locations ?? [];
        const fetchedPackages = json.data.packages ?? [];
        const fetchedStudios = json.data.studios ?? [];

        setLocations(fetchedLocations);
        setPackages(fetchedPackages);
        setStudios(fetchedStudios);

        const queryLocationId = searchParams.get("locationId") || "";
        const queryCity = searchParams.get("city") || "";
        const queryPackageId = searchParams.get("packageId") || "";
        const queryStudioType = searchParams.get("studioType") || "";

        const locationByCity = fetchedLocations.find(
          location => location.name.toLowerCase() === queryCity.toLowerCase()
        );

        const resolvedLocationId =
          fetchedLocations.find(location => location.id === queryLocationId)?.id ||
          locationByCity?.id ||
          fetchedLocations[0]?.id ||
          "";

        const resolvedPackageId =
          fetchedPackages.find(item => item.id === queryPackageId)?.id || fetchedPackages[0]?.id || "";

        const resolvedStudioType =
          fetchedStudios.find(studio => studio.type === queryStudioType)?.type ||
          fetchedStudios[0]?.type ||
          "";

        setSelectedLocationId(resolvedLocationId);
        setSelectedPackageId(resolvedPackageId);
        setSelectedStudioType(resolvedStudioType);
      } catch (error: any) {
        if (error.name !== "AbortError") {
          setErrorMessage(error.message || "Gagal memuat data awal booking");
        }
      } finally {
        setMetaLoading(false);
      }
    };

    void loadMeta();

    return () => controller.abort();
  }, [searchParams]);

  useEffect(() => {
    if (!selectedLocationId || !selectedPackageId || !selectedStudioType) {
      return;
    }

    const controller = new AbortController();

    const fetchSlotsForDate = async (targetDate: Date) => {
      const query = new URLSearchParams({
        locationId: selectedLocationId,
        packageId: selectedPackageId,
        studioType: selectedStudioType,
        date: toDateOnlyString(targetDate),
      });

      const response = await fetch(`${API_BASE_URL}/api/bookings/availability?${query.toString()}`, {
        method: "GET",
        signal: controller.signal,
      });

      const json = (await response.json()) as AvailabilityResponse;

      if (!response.ok) {
        throw new Error((json as any)?.message || "Gagal memuat slot waktu");
      }

      const fetchedSlots = (json.data.slots ?? []).sort((a, b) => {
        const aTime = new Date(a.startTime).getTime();
        const bTime = new Date(b.startTime).getTime();
        return aTime - bTime;
      });

      return fetchedSlots;
    };

    const findNearestAvailableFutureDate = async (baseDate: Date) => {
      for (let offset = 1; offset <= AUTO_JUMP_SEARCH_DAYS; offset += 1) {
        const candidateDate = addDays(baseDate, offset);
        const candidateSlots = await fetchSlotsForDate(candidateDate);
        const hasAvailableSlot = candidateSlots.some(slot => slot.status === "available");

        if (hasAvailableSlot) {
          return {
            date: candidateDate,
            slots: candidateSlots,
          };
        }
      }

      return null;
    };

    const loadAvailability = async () => {
      setAvailabilityLoading(true);
      setErrorMessage(null);
      setSelectedSlotId("");

      try {
        const fetchedSlots = await fetchSlotsForDate(selectedDate);
        const hasAvailableSlot = fetchedSlots.some(slot => slot.status === "available");

        if (hasAvailableSlot) {
          setSlots(fetchedSlots);
          return;
        }

        const nearestWithSlot = await findNearestAvailableFutureDate(selectedDate);

        if (nearestWithSlot) {
          setSelectedDate(nearestWithSlot.date);
          setMonthCursor(nearestWithSlot.date);
          setSlots(nearestWithSlot.slots);
          return;
        }

        setSlots(fetchedSlots);
      } catch (error: any) {
        if (error.name !== "AbortError") {
          setErrorMessage(error.message || "Gagal memuat slot waktu");
          setSlots([]);
        }
      } finally {
        setAvailabilityLoading(false);
      }
    };

    void loadAvailability();

    return () => controller.abort();
  }, [selectedLocationId, selectedPackageId, selectedStudioType, selectedDate]);

  const handleMonthNavigation = (direction: "prev" | "next") => {
    const next = new Date(monthCursor);
    next.setMonth(next.getMonth() + (direction === "next" ? 1 : -1));
    setMonthCursor(next);
  };

  const handlePickDate = (day: number) => {
    const nextDate = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), day);
    setSelectedDate(nextDate);
  };

  const handleNext = () => {
    if (!selectedSlot) {
      alert("Pilih slot waktu terlebih dahulu");
      return;
    }

    const nextParams = new URLSearchParams({
      locationId: selectedLocationId,
      ...(incomingCity ? { city: incomingCity } : {}),
      packageId: selectedPackageId,
      studioType: selectedStudioType,
      scheduleId: selectedSlot.scheduleId,
      studioId: selectedSlot.studioId,
      date: toDateOnlyString(selectedDate),
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      ...(incomingCustomerName ? { customerName: incomingCustomerName } : {}),
      ...(incomingCustomerPhone ? { customerPhone: incomingCustomerPhone } : {}),
      ...(incomingAddOns ? { addOns: incomingAddOns } : {}),
    });

    router.push(`/booking/payment?${nextParams.toString()}`);
  };

  return (
    <div className={`${monserratFont.className} bg-[#EFEFEF] text-[#0B1957]`}>
      <div className="fixed top-0 w-full z-50">
        <NavigationBar />
      </div>

      <main className="min-h-screen p-20 pt-35">
        <div className="mx-auto">
          <div className="pb-13 flex justify-center">
            <div className="flex gap-x-3">
              <div className="w-7 h-2 bg-[#FA9EBC] rounded-full" />
              <div className="w-7 h-2 bg-[#FA9EBC] rounded-full" />
              <div className="w-7 h-2 bg-[#FA9EBC] rounded-full" />
              <div className="w-7 h-2 bg-gray-300 rounded-full" />
              <div className="w-7 h-2 bg-gray-300 rounded-full" />
              <div className="w-7 h-2 bg-gray-300 rounded-full" />
            </div>
          </div>

          <h1 className="mb-8 text-4xl font-semibold leading-none">Pilih Jadwal</h1>

          {errorMessage && (
            <div className="mb-6 rounded-xl border border-[#FA9EBC] bg-[#fdebf2] px-5 py-4 text-[18px] text-[#B33362]">
              {errorMessage}
            </div>
          )}

          <section className="flex gap-12">
            <div className="w-120 rounded-[26px] bg-[#F4E6EE] p-8 ">
              <div className="mb-7 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleMonthNavigation("prev")}
                  className="text-[28px] font-semibold leading-none"
                >
                  &lt;
                </button>
                <span className="text-[34px] font-semibold">
                  {MONTH_NAMES[monthCursor.getMonth()]} {monthCursor.getFullYear()}
                </span>
                <button
                  type="button"
                  onClick={() => handleMonthNavigation("next")}
                  className="text-[28px] font-semibold leading-none"
                >
                  &gt;
                </button>
              </div>

              <div className="mb-5 grid grid-cols-7 gap-y-5 text-center text-[20px] text-[#666]">
                {DAY_LABELS.map(day => (
                  <span key={day}>{day}</span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-y-5 text-center text-[24px]">
                {calendarCells.map((day, index) => {
                  if (!day) {
                    return <span key={`empty-${index}`} />;
                  }

                  const isSelected =
                    day === selectedDate.getDate() &&
                    monthCursor.getMonth() === selectedDate.getMonth() &&
                    monthCursor.getFullYear() === selectedDate.getFullYear();

                  return (
                    <button
                      key={`day-${day}`}
                      type="button"
                      onClick={() => handlePickDate(day)}
                      className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full transition ${
                        isSelected ? "bg-[#FA9EBC] font-semibold" : "hover:bg-[#f8cad9]"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 rounded-[26px] bg-[#F4E6EE] p-8 ">
              <h2 className="mb-5 text-[32px] font-semibold">Slot Waktu Tersedia</h2>
              <div className="mb-6 flex gap-4">
                <select
                  value={selectedLocationId}
                  onChange={event => setSelectedLocationId(event.target.value)}
                  className="min-w-[#220] rounded-xl border border-[#dec6d2] bg-white px-4 py-3 text-xl"
                > 
                  {locations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedPackageId}
                  onChange={event => setSelectedPackageId(event.target.value)}
                  className="min-w-[#280p] rounded-xl border border-[#dec6d2] bg-white px-4 py-3 text-xl"
                >
                  {packages.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedStudioType}
                  onChange={event => setSelectedStudioType(event.target.value)}
                  className="min-w-[#220] rounded-xl border border-[#dec6d2] bg-white px-4 py-3 text-xl"
                >
                  {[...new Set(studios.map(studio => studio.type))].map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-5 gap-4">
                {availabilityLoading || metaLoading ? (
                  <div className="col-span-5 rounded-xl bg-white px-4 py-5 text-center text-[20px] text-[#666]">
                    Memuat slot waktu...
                  </div>
                ) : slots.length === 0 ? (
                  <div className="col-span-5 rounded-xl bg-white px-4 py-5 text-center text-[20px] text-[#666]">
                    Tidak ada slot tersedia di tanggal ini
                  </div>
                ) : (
                  slots.map(slot => {
                    const isSelected = slot.scheduleId === selectedSlotId;
                    const isBooked = slot.status !== "available";

                    return (
                      <button
                        key={slot.scheduleId}
                        type="button"
                        onClick={() => {
                          if (!isBooked) {
                            setSelectedSlotId(slot.scheduleId);
                          }
                        }}
                        disabled={isBooked}
                        className={`rounded-xl border-2 px-2 py-4 text-xl font-semibold transition ${
                          isBooked
                            ? "border-transparent bg-[#dfdfdf] text-[#050b29] cursor-not-allowed"
                            : isSelected
                            ? "border-[#FA9EBC] bg-[#0B1957] text-white"
                            : "border-transparent bg-white hover:border-[#FA9EBC]"
                        }`}
                      >
                        {formatHour(slot.startTime)}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </section>

          <div className="mt-20 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                const params = new URLSearchParams({
                  locationId: selectedLocationId,
                  ...(incomingCity ? { city: incomingCity } : {}),
                  packageId: selectedPackageId,
                  studioType: selectedStudioType,
                  ...(incomingCustomerName ? { customerName: incomingCustomerName } : {}),
                  ...(incomingCustomerPhone ? { customerPhone: incomingCustomerPhone } : {}),
                  ...(incomingAddOns ? { addOns: incomingAddOns } : {}),
                });
                router.push(`/booking/package?${params.toString()}`);
              }}
              className="flex flex-row items-center gap-x-2 text-xl p-2 border-2 border-[#FA9EBC] rounded-xl pl-6 pr-6"
            >
              <IoArrowBack />
              <span>Kembali</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="flex flex-row items-center bg-[#FA9EBC] text-[#0B1957] pl-6 pr-6 rounded-xl"
            >
              <span>Lanjut</span>
              <IoIosArrowRoundForward className="text-[46px]" />
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
