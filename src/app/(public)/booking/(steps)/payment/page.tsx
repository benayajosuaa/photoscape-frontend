"use client";

import Footer from "@/utility/footer";
import NavigationBar from "@/utility/navbar";
import { Montserrat } from "next/font/google";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { IoArrowBack } from "react-icons/io5";

const monserratFont = Montserrat({
  subsets: ["latin"],
  weight: "500",
});

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
const ENV_AUTH_TOKEN = process.env.NEXT_PUBLIC_BOOKING_AUTH_TOKEN || "";

type BookingLocation = {
  id: string;
  name: string;
};

type BookingPackage = {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  maxCapacity: number;
};

type BookingAddOn = {
  id: string;
  name: string;
  price: number;
};

type BookingMetaResponse = {
  data: {
    locations: BookingLocation[];
    packages: BookingPackage[];
    addOns: BookingAddOn[];
  };
};

type CreateBookingResponse = {
  data: {
    bookingId: string;
  };
};

function formatRupiah(value: number) {
  return `Rp ${new Intl.NumberFormat("id-ID").format(value)}`;
}

function formatBookingDate(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return "-";

  const formatted = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function formatBookingTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";

  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  return `${hours}.${minutes} WIB`;
}

function getClientAuthToken() {
  if (typeof window === "undefined") return ENV_AUTH_TOKEN;

  const fromStorage =
    window.localStorage.getItem("authToken") ||
    window.localStorage.getItem("token") ||
    window.localStorage.getItem("accessToken") ||
    "";

  return fromStorage || ENV_AUTH_TOKEN;
}

function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [locations, setLocations] = useState<BookingLocation[]>([]);
  const [packages, setPackages] = useState<BookingPackage[]>([]);
  const [addOns, setAddOns] = useState<BookingAddOn[]>([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const locationId = searchParams.get("locationId") || "";
  const incomingCity = searchParams.get("city") || "";
  const packageId = searchParams.get("packageId") || "";
  const studioType = searchParams.get("studioType") || "";
  const scheduleId = searchParams.get("scheduleId") || "";
  const studioId = searchParams.get("studioId") || "";
  const date = searchParams.get("date") || "";
  const startTime = searchParams.get("startTime") || "";
  const endTime = searchParams.get("endTime") || "";
  const customerName = searchParams.get("customerName") || "";
  const customerPhone = searchParams.get("customerPhone") || "";
  const incomingAddOns = searchParams.get("addOns") || "";

  useEffect(() => {
    const controller = new AbortController();

    const loadMeta = async () => {
      setLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/bookings/meta`, {
          method: "GET",
          signal: controller.signal,
        });

        const json = (await response.json()) as BookingMetaResponse;

        if (!response.ok) {
          throw new Error((json as any)?.message || "Gagal memuat data pembayaran");
        }

        setLocations(json.data.locations ?? []);
        setPackages(json.data.packages ?? []);
        setAddOns(json.data.addOns ?? []);
      } catch (error: any) {
        if (error.name !== "AbortError") {
          setErrorMessage(error.message || "Gagal memuat data pembayaran");
        }
      } finally {
        setLoading(false);
      }
    };

    void loadMeta();

    return () => controller.abort();
  }, []);

  const selectedLocation = useMemo(
    () =>
      locations.find(location => location.id === locationId || location.name.toLowerCase() === incomingCity.toLowerCase()) ??
      null,
    [incomingCity, locationId, locations]
  );

  const selectedPackage = useMemo(() => packages.find(item => item.id === packageId) ?? null, [packageId, packages]);

  const parsedAddOns = useMemo(() => {
    if (!incomingAddOns) return [] as Array<{ addOn: BookingAddOn; quantity: number; subtotal: number }>;

    return incomingAddOns
      .split(",")
      .map(part => {
        const [addOnId, qtyRaw] = part.split(":");
        const quantity = Number(qtyRaw);
        const addOn = addOns.find(item => item.id === addOnId);

        if (!addOn || !Number.isInteger(quantity) || quantity < 1) {
          return null;
        }

        return {
          addOn,
          quantity,
          subtotal: addOn.price * quantity,
        };
      })
      .filter(Boolean) as Array<{ addOn: BookingAddOn; quantity: number; subtotal: number }>;
  }, [incomingAddOns, addOns]);

  const addOnTotal = useMemo(
    () => parsedAddOns.reduce((sum, item) => sum + item.subtotal, 0),
    [parsedAddOns]
  );

  const packagePrice = selectedPackage?.price ?? 0;
  const grandTotal = packagePrice + addOnTotal;

  const handleConfirm = async () => {
    setSubmitMessage(null);

    if (!selectedPackage || !selectedLocation) {
      setSubmitMessage("Data paket atau lokasi belum lengkap.");
      return;
    }

    if (!scheduleId || !studioType) {
      setSubmitMessage("Data jadwal belum lengkap. Silakan kembali ke halaman jadwal.");
      return;
    }

    if (!customerName || !customerPhone) {
      setSubmitMessage("Nama dan nomor HP belum tersedia. Silakan isi ulang dari langkah awal booking.");
      return;
    }

    const token = getClientAuthToken();

    if (!token) {
      setSubmitMessage(
        "Butuh token login untuk buat booking ke backend. Set `NEXT_PUBLIC_BOOKING_AUTH_TOKEN` atau simpan token di localStorage (`authToken`)."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingPayload = {
        customerName,
        customerPhone,
        locationId: selectedLocation.id,
        packageId: selectedPackage.id,
        studioType,
        scheduleId,
        participantCount: 1,
        addOns: parsedAddOns.map(item => ({
          addOnId: item.addOn.id,
          quantity: item.quantity,
        })),
      };

      const bookingResponse = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingPayload),
      });

      const bookingJson = (await bookingResponse.json()) as CreateBookingResponse;

      if (!bookingResponse.ok) {
        throw new Error((bookingJson as any)?.message || "Gagal membuat booking");
      }

      const bookingId = bookingJson?.data?.bookingId;

      if (!bookingId) {
        throw new Error("Booking berhasil dibuat tapi bookingId tidak ditemukan");
      }

      setSubmitMessage("Booking berhasil dibuat dan siap lanjut ke metode pembayaran.");

      const nextParams = new URLSearchParams({
        bookingId,
        locationId: selectedLocation.id,
        packageId: selectedPackage.id,
        studioId,
        scheduleId,
        ...(incomingCity ? { city: incomingCity } : {}),
        ...(date ? { date } : {}),
        ...(startTime ? { startTime } : {}),
        ...(endTime ? { endTime } : {}),
      });

      router.push(`/booking/method?${nextParams.toString()}`);
    } catch (error: any) {
      setSubmitMessage(error.message || "Gagal memproses booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${monserratFont.className} bg-[#EFEFEF] text-[#0B1957]`}>
      <div className="fixed top-0 z-50 w-full">
        <NavigationBar />
      </div>

      <main className="min-h-screen p-4 pt-28 sm:p-8 sm:pt-32 lg:p-20 lg:pt-35">
        <div className="mx-auto ">
          

          <div className="mb-14 flex justify-center">
            <div className="flex gap-x-3">
              <div className="w-7 h-2 bg-[#FA9EBC] rounded-full" />
              <div className="w-7 h-2 bg-[#FA9EBC] rounded-full" />
              <div className="w-7 h-2 bg-[#FA9EBC] rounded-full" />
              <div className="w-7 h-2 bg-[#FA9EBC] rounded-full" />
              <div className="w-7 h-2 bg-gray-300 rounded-full" />
              <div className="w-7 h-2 bg-gray-300 rounded-full" />
            </div>
          </div>

          {(errorMessage || submitMessage) && (
            <div className="mx-auto mb-6 w-full max-w-[560px] rounded-xl border border-[#FA9EBC] bg-[#fdebf2] px-5 py-4 text-[#B33362]">
              {errorMessage || submitMessage}
            </div>
          )}

          <section className="mx-auto w-full max-w-[800px] rounded-[20px] bg-[#F5F5F5] px-4 py-6 shadow-[0_8px_18px_rgba(15,24,63,0.2)] sm:px-7 sm:py-8 lg:px-9">
            <h1 className="mb-8 text-center text-[28px] font-semibold leading-none text-[#0B1957] sm:mb-14 sm:text-[36px]">Ringkasan Pesanan</h1>

            {loading ? (
              <p className="text-center text-xl">Memuat ringkasan...</p>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:gap-6">
                  <div>
                    <p className="text-xl font-semibold leading-tight sm:text-2xl">{selectedPackage?.name || "Paket"}</p>
                    <p className="mt-1 text-base text-[#6b6b6b] sm:mt-2 sm:text-lg">{formatBookingDate(date)}</p>
                    <p className="text-base text-[#6b6b6b] sm:text-lg">Waktu: {formatBookingTime(startTime)}</p>
                    <p className="text-base text-[#6b6b6b] sm:text-lg">Lokasi: {selectedLocation?.name || "-"}</p>
                  </div>
                  <p className="text-[24px] font-semibold leading-none sm:text-[30px]">{formatRupiah(packagePrice)}</p>
                </div>

                {parsedAddOns.length > 0 && (
                  <div className="space-y-2 mb-5">
                    {parsedAddOns.map(item => (
                      <div key={item.addOn.id} className="flex items-center justify-between gap-4 text-sm italic text-[#707070] sm:text-[16px]">
                        <p>
                          + {item.addOn.name} : {item.quantity} Orang
                        </p>
                        <p>{formatRupiah(item.subtotal)}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-dashed border-[#969696] pt-8 sm:pt-12">
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-semibold leading-none sm:text-3xl">Total</p>
                    <p className="text-2xl font-semibold leading-none sm:text-3xl">{formatRupiah(grandTotal)}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isSubmitting || loading}
                  className={`mt-8 w-full rounded-2xl py-3 text-lg font-semibold leading-none transition sm:mt-10 sm:py-4 sm:text-xl ${
                    isSubmitting || loading
                      ? "cursor-not-allowed bg-[#f0bfd1] text-[#6e6e6e]"
                      : "bg-[#FA9EBC] text-[#0B1957] hover:opacity-90"
                  }`}
                >
                  {isSubmitting ? "Memproses..." : "Konfirmasi Pesanan"}
                </button>
              </div>
            )}
          </section>

          <div className="mt-8 sm:mt-12">
            <button
              type="button"
              onClick={() => {
                const backParams = new URLSearchParams({
                  ...(locationId ? { locationId } : {}),
                  ...(incomingCity ? { city: incomingCity } : {}),
                  ...(packageId ? { packageId } : {}),
                  ...(studioType ? { studioType } : {}),
                  ...(customerName ? { customerName } : {}),
                  ...(customerPhone ? { customerPhone } : {}),
                  ...(incomingAddOns ? { addOns: incomingAddOns } : {}),
                });

                router.push(`/booking/schedule?${backParams.toString()}`);
              }}
              className="flex items-center gap-x-2 rounded-xl border-2 border-[#FA9EBC] bg-white px-5 py-2 text-base text-[#0B1957] sm:px-6 sm:text-xl"
            >
              <IoArrowBack />
              <span>Kembali</span>
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#EFEFEF]" />}>
      <PaymentPageContent />
    </Suspense>
  );
}
