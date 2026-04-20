"use client";

import Footer from "@/utility/footer";
import NavigationBar from "@/utility/navbar";
import { IoArrowBack } from "react-icons/io5";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Montserrat } from "@/lib/font-fallback";

import { RiBarcodeBoxLine, RiBankLine, RiWallet3Line } from "react-icons/ri";
import type { ReactNode } from "react";

const monserratFont = Montserrat({
  subsets: ["latin"],
  weight: "500",
});

const API_BASE_URL = process.env.NEXT_PUBLIC_API_PROXY_URL || "/api/proxy";
const ENV_AUTH_TOKEN = process.env.NEXT_PUBLIC_BOOKING_AUTH_TOKEN || "";

type PaymentMethod = "qris" | "bca_va" | "mandiri_va" | "gopay" | "ovo";

type BookingSummaryResponse = {
  data: {
    bookingId: string;
    location: { id: string; name: string };
    package: { id: string; name: string; price: number };
    schedule: {
      id: string;
      date: string;
      startTime: string;
      endTime: string;
    };
    addOns: Array<{
      id: string;
      name: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }>;
    pricing: {
      packagePrice: number;
      addOnTotal: number;
      totalPrice: number;
    };
  };
};

type CreatePaymentResponse = {
  data: {
    bookingId: string;
    paymentId: string;
    amount: number;
    method: PaymentMethod;
    status: string;
    expiredAt: string | null;
    autoSuccessAfterSeconds: number | null;
    autoSuccessAt: string | null;
    gatewayReference: string | null;
    paymentPageUrl: string | null;
    instructions: string[];
  };
};

type PaymentOption = {
  key: PaymentMethod;
  label: string;
  group: "main" | "va" | "ewallet";
  icon: ReactNode;
};

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    key: "qris",
    label: "QRIS",
    group: "main",
    icon:(
      <img src="/icon/qris.png" className="h-5 w-auto" alt="" />
    ),
  },
  {
    key: "bca_va",
    label: "BCA Virtual Account",
    group: "va",
    icon:(
      <img src="/icon/1.png" className="h-10 w-auto" alt="" />
    ),
  },
  {
    key: "mandiri_va",
    label: "Mandiri Virtual Account",
    group: "va",
    icon:(
      <img src="/icon/2.png" className="h-10 w-auto" alt="" />
    ),
  },
  {
    key: "gopay",
    label: "GoPay",
    group: "ewallet",
    icon:(
      <img src="/icon/gopay.webp" className="h-6 w-auto" alt="" />
    ),
  },
  {
    key: "ovo",
    label: "OVO",
    group: "ewallet",
    icon:(
      <img src="/icon/ovo.webp" className="h-6 w-auto" alt="" />
    ),
  },
];

function formatRupiah(value: number) {
  return `Rp ${new Intl.NumberFormat("id-ID").format(value)}`;
}

function formatBookingDate(value: string) {
  const date = new Date(value);
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

function formatBookingTime(value: string) {
  const date = new Date(value);
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

function MethodPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId") || "";

  const [summary, setSummary] = useState<BookingSummaryResponse["data"] | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | "">("qris");
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadSummary = async () => {
      if (!bookingId) {
        setLoadingSummary(false);
        setMessage("bookingId tidak ditemukan. Silakan ulangi dari langkah pembayaran.");
        return;
      }

      const token = getClientAuthToken();

      if (!token) {
        setLoadingSummary(false);
        setMessage(
          "Butuh token login untuk memuat ringkasan booking. Set `NEXT_PUBLIC_BOOKING_AUTH_TOKEN` atau simpan token di localStorage (`authToken`)."
        );
        return;
      }

      setLoadingSummary(true);
      setMessage(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/summary`, {
          method: "GET",
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const json = (await response.json()) as BookingSummaryResponse;

        if (!response.ok) {
          throw new Error((json as { message?: string })?.message || "Gagal memuat ringkasan booking");
        }

        setSummary(json.data);
      } catch (error: unknown) {
        if ((error as { name?: string })?.name !== "AbortError") {
          const fallback = "Gagal memuat ringkasan booking";
          setMessage((error as { message?: string })?.message || fallback);
          setSummary(null);
        }
      } finally {
        setLoadingSummary(false);
      }
    };

    void loadSummary();

    return () => controller.abort();
  }, [bookingId]);

  const groupedOptions = useMemo(() => {
    return {
      main: PAYMENT_OPTIONS.filter(item => item.group === "main"),
      va: PAYMENT_OPTIONS.filter(item => item.group === "va"),
      ewallet: PAYMENT_OPTIONS.filter(item => item.group === "ewallet"),
    };
  }, []);

  const addOnText = useMemo(() => {
    if (!summary || summary.addOns.length === 0) return null;

    const first = summary.addOns[0];
    return `+ ${first.name} : ${first.quantity} Orang`;
  }, [summary]);

  const handlePayNow = async () => {
    setMessage(null);

    if (!bookingId) {
      setMessage("bookingId tidak ditemukan. Silakan ulangi dari langkah sebelumnya.");
      return;
    }

    if (!selectedMethod) {
      setMessage("Pilih metode pembayaran terlebih dahulu.");
      return;
    }

    const token = getClientAuthToken();
    if (!token) {
      setMessage(
        "Butuh token login untuk membuat pembayaran. Set `NEXT_PUBLIC_BOOKING_AUTH_TOKEN` atau simpan token di localStorage (`authToken`)."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          method: selectedMethod,
        }),
      });

      const json = (await response.json()) as CreatePaymentResponse;

      if (!response.ok) {
        throw new Error((json as { message?: string })?.message || "Gagal membuat pembayaran");
      }

      const payment = json.data;
      const nextParams = new URLSearchParams({
        bookingId,
        paymentId: payment.paymentId,
        method: payment.method,
        amount: String(payment.amount),
        ...(payment.status ? { status: payment.status } : {}),
        ...(payment.expiredAt ? { expiredAt: payment.expiredAt } : {}),
        ...(payment.autoSuccessAfterSeconds
          ? { autoSuccessAfterSeconds: String(payment.autoSuccessAfterSeconds) }
          : {}),
        ...(payment.autoSuccessAt ? { autoSuccessAt: payment.autoSuccessAt } : {}),
        ...(payment.gatewayReference ? { gatewayReference: payment.gatewayReference } : {}),
        ...(payment.paymentPageUrl ? { paymentPageUrl: payment.paymentPageUrl } : {}),
        ...(summary?.location?.name ? { location: summary.location.name } : {}),
        ...(summary?.package?.name ? { package: summary.package.name } : {}),
      });

      router.push(`/booking/confirm?${nextParams.toString()}`);
    } catch (error: unknown) {
      const fallback = "Gagal membuat pembayaran";
      setMessage((error as { message?: string })?.message || fallback);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${monserratFont.className} bg-[#EFEFEF] text-[#0B1957]`}>
      <div className="fixed top-0 w-full z-50">
        <NavigationBar />
      </div>

      <main className="min-h-screen p-4 pt-28 sm:p-8 sm:pt-32 lg:p-20 lg:pt-35">
        <div className="">
        

          <div className="mb-14 flex justify-center">
            <div className="flex gap-x-3">
              <div className="w-7 h-2 bg-[#FA9EBC] rounded-full" />
              <div className="w-7 h-2 bg-[#FA9EBC] rounded-full" />
              <div className="w-7 h-2 bg-[#FA9EBC] rounded-full" />
              <div className="w-7 h-2 bg-[#FA9EBC] rounded-full" />
              <div className="w-7 h-2 bg-[#FA9EBC] rounded-full" />
              <div className="w-7 h-2 bg-gray-300 rounded-full" />
            </div>
          </div>

          {message && (
            <div className="mb-6 rounded-xl border border-[#FA9EBC] bg-[#fdebf2] px-5 py-4 text-[#B33362]">{message}</div>
          )}

          <div className="flex flex-col gap-8 lg:flex-row lg:gap-x-20">
            {/* PAYMENT METHOD */}
            <div className="flex w-full lg:w-1/2">
              <section>
                <h1 className="text-xl font-semibold leading-none text-[#0B1957] sm:text-2xl">Pilih Pembayaran</h1>
                <p className="mt-4 text-base text-[#515151] sm:mt-6 sm:text-xl">
                  Selesaikan pesanan Anda dengan metode pembayaran yang tersedia.
                </p>

                <div className="mt-10 space-y-8">
                  {/* Method Pembayaran */}
                  <div className="space-y-4">
                    {groupedOptions.main.map(option => {
                      const isSelected = selectedMethod === option.key;

                      return (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() => setSelectedMethod(option.key)}
                          className="flex w-full items-center justify-between rounded-xl border border-[#ccb0bd] bg-[#EBC9D8] px-5 py-3 text-left"
                        >
                          <span className="flex items-center gap-4">
                            {option.icon}
                            <span className="text-base font-semibold sm:text-xl">{option.label}</span>
                          </span>
                          <span className="flex h-7 w-7 items-center justify-center rounded-full border-3 border-[#0B1957]">
                            <span
                              className={`h-3 w-3 rounded-full bg-[#0B1957] transition-opacity ${
                                isSelected ? "opacity-100" : "opacity-0"
                              }`}
                            />
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div>
                    <h2 className="mb-4 mt-8 text-xl font-semibold text-[#515151] sm:mt-10 sm:text-2xl">Virtual Account</h2>
                    <div className="space-y-4">
                      {groupedOptions.va.map(option => {
                        const isSelected = selectedMethod === option.key;

                        return (
                          <button
                            key={option.key}
                            type="button"
                            onClick={() => setSelectedMethod(option.key)}
                            className="flex w-full items-center justify-between rounded-xl border border-[#ccb0bd] bg-[#EBC9D8] 100 px-5 py-3 text-left"
                          >
                            <span className="flex items-center gap-3 object-cover">
                              <span className="items-center justify-center">
                                {option.icon}
                              </span>
                              <span className="text-base font-semibold sm:text-xl">
                                {option.label}
                              </span>
                            </span>
                            
                            <span className="flex h-7 w-7 items-center justify-center rounded-full border-3 border-[#0B1957]">
                              <span
                                className={`h-3 w-3 rounded-full bg-[#0B1957] transition-opacity ${
                                  isSelected ? "opacity-100" : "opacity-0"
                                }`}
                              />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h2 className="mb-4 text-xl font-semibold text-[#515151] sm:text-2xl">E-wallet</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {groupedOptions.ewallet.map(option => {
                        const isSelected = selectedMethod === option.key;

                        return (
                          <button
                            key={option.key}
                            type="button"
                            onClick={() => setSelectedMethod(option.key)}
                            className="flex w-full items-center justify-between rounded-xl border border-[#ccb0bd] bg-[#EBC9D8] px-5 py-3 text-left"
                          >
                            <span className="flex items-center gap-4">
                              {option.icon}
                              <span className="text-base font-semibold sm:text-xl">{option.label}</span>
                            </span>
                            <span className="flex h-7 w-7 items-center justify-center rounded-full border-3 border-[#0B1957]">
                              <span
                                className={`h-3 w-3 rounded-full bg-[#0B1957] transition-opacity ${
                                  isSelected ? "opacity-100" : "opacity-0"
                                }`}
                              />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-20">
                  <button
                    type="button"
                    onClick={() => router.push(`/booking/payment?${searchParams.toString()}`)}
                    className="flex flex-row items-center gap-x-2 rounded-xl border-2 border-[#FA9EBC] p-2 pl-4 pr-4 text-base sm:pl-6 sm:pr-6 sm:text-xl"
                  >
                    <span><IoArrowBack /> </span>
                    <span>Kembali</span>
                  </button>
                </div>
              </section>
            </div>
            
            {/* RINGKASAN */}
            <div className="flex w-full lg:w-1/2">
               <aside className="h-fit rounded-[20px] bg-[#F5F5F5] w-full px-6 py-7 ">
                  <h3 className="mb-6 text-xl leading-none sm:text-2xl">Ringkasan Pesanan</h3>

                  {loadingSummary || !summary ? (
                    <p className="text-lg text-[#666] sm:text-[28px]">Memuat ringkasan...</p>
                  ) : (
                    <div>
                      <div className="flex items-start justify-between gap-y-4 pb-10">
                        <div>
                          <p className="mb-2 text-2xl font-bold leading-tight sm:text-3xl">{summary.package.name}</p>
                          <p className="mb-6 text-[30px] font-semibold leading-none sm:mb-10 sm:text-[40px]">{formatRupiah(summary.pricing.packagePrice)}</p>
                          
                          <p className="text-base text-[#6b6b6b] sm:text-2xl">Waktu: {formatBookingTime(summary.schedule.startTime)} - {formatBookingDate(summary.schedule.date)} </p>
                          <p className="text-base text-[#6b6b6b] sm:text-2xl">Lokasi: {summary.location.name}</p>
                        </div>
                        
                      </div>

                      {addOnText && (
                        <div className="mt-5 flex items-center justify-between gap-4 text-base text-[#707070] sm:text-2xl">
                          <p>{addOnText}</p>
                          <p>{formatRupiah(summary.pricing.addOnTotal)}</p>
                        </div>
                      )}

                      <div className="mt-5 border-t pt-10 text-[#0B1957] border-dashed border-[#989898] mb-4">
                        <div className="flex items-center justify-between">
                          <p className="text-2xl font-semibold leading-none sm:text-3xl">Total:</p>
                          <p className="text-2xl font-semibold leading-none sm:text-3xl">{formatRupiah(summary.pricing.totalPrice)}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handlePayNow}
                        disabled={isSubmitting || loadingSummary}
                        className={`mt-6 w-full rounded-lg py-3 text-lg font-semibold leading-none transition sm:py-4 sm:text-xl ${
                          isSubmitting || loadingSummary
                            ? "cursor-not-allowed bg-[#f0bfd1] text-[#6e6e6e]"
                            : "bg-[#FA9EBC] text-[#0B1957] hover:opacity-90"
                        }`}
                      >
                        {isSubmitting ? "Memproses..." : "Bayar Sekarang"}
                      </button>
                    </div>
                  )}
                </aside>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function MethodPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#EFEFEF]" />}>
      <MethodPageContent />
    </Suspense>
  );
}
