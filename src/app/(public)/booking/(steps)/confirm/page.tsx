"use client";

import Footer from "@/utility/footer";
import NavigationBar from "@/utility/navbar";
import { Montserrat } from "next/font/google";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import { IoIosArrowRoundForward } from "react-icons/io";
import { FiClock } from "react-icons/fi";

const monserratFont = Montserrat({
  subsets: ["latin"],
  weight: "500",
});

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
const ENV_AUTH_TOKEN = process.env.NEXT_PUBLIC_BOOKING_AUTH_TOKEN || "";

type PaymentMethod = "qris" | "bca_va" | "mandiri_va" | "gopay" | "ovo";

type BookingSummaryResponse = {
  data: {
    bookingId: string;
    bookingCode: string;
    status: string;
    location: { id: string; name: string };
    package: { id: string; name: string; price: number };
    addOns: Array<{
      id: string;
      name: string;
      quantity: number;
      subtotal: number;
    }>;
    pricing: {
      packagePrice: number;
      addOnTotal: number;
      totalPrice: number;
    };
    payment: {
      id: string;
      method: PaymentMethod;
      status: string;
      amount: number;
      expiredAt: string | null;
      paidAt: string | null;
      gatewayReference: string | null;
    } | null;
  };
};

function formatRupiah(value: number) {
  return `Rp ${new Intl.NumberFormat("id-ID").format(value)}`;
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

function formatCountdown(totalSeconds: number) {
  const normalized = Math.max(totalSeconds, 0);
  const minutes = Math.floor(normalized / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(normalized % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
}

export default function ConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const bookingId = searchParams.get("bookingId") || "";
  const paymentId = searchParams.get("paymentId") || "";
  const methodFromQuery = (searchParams.get("method") || "") as PaymentMethod | "";
  const expiredAtFromQuery = searchParams.get("expiredAt") || "";
  const paymentPageUrlFromQuery = searchParams.get("paymentPageUrl") || "";

  const [summary, setSummary] = useState<BookingSummaryResponse["data"] | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);

  const activeMethod: PaymentMethod | "" = summary?.payment?.method || methodFromQuery;

  const expiredAt = summary?.payment?.expiredAt || expiredAtFromQuery || null;

  const scanQrUrl = useMemo(() => {
    if (paymentPageUrlFromQuery.includes("/qris")) {
      return paymentPageUrlFromQuery;
    }

    if (!paymentId) return "";
    return `${API_BASE_URL}/api/bookings/payments/${paymentId}/qris`;
  }, [paymentId, paymentPageUrlFromQuery]);

  const qrImageUrl = useMemo(() => {
    if (!scanQrUrl) return "";
    return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=0&data=${encodeURIComponent(scanQrUrl)}`;
  }, [scanQrUrl]);

  const refreshSummary = async (signal?: AbortSignal) => {
    if (!bookingId) {
      throw new Error("bookingId tidak ditemukan. Silakan ulangi dari langkah sebelumnya.");
    }

    const token = getClientAuthToken();
    if (!token) {
      throw new Error(
        "Butuh token login untuk memuat status pembayaran. Set `NEXT_PUBLIC_BOOKING_AUTH_TOKEN` atau simpan token di localStorage (`authToken`)."
      );
    }

    const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/summary`, {
      method: "GET",
      signal,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const json = (await response.json()) as BookingSummaryResponse;

    if (!response.ok) {
      throw new Error((json as { message?: string })?.message || "Gagal memuat ringkasan pembayaran");
    }

    setSummary(json.data);
    return json.data;
  };

  useEffect(() => {
    const controller = new AbortController();

    const init = async () => {
      setLoadingSummary(true);
      setMessage(null);

      try {
        await refreshSummary(controller.signal);
      } catch (error: unknown) {
        if ((error as { name?: string })?.name !== "AbortError") {
          setMessage((error as { message?: string })?.message || "Gagal memuat ringkasan pembayaran");
          setSummary(null);
        }
      } finally {
        setLoadingSummary(false);
      }
    };

    void init();

    return () => controller.abort();
  }, [bookingId]);

  useEffect(() => {
    if (!expiredAt) {
      setTimeLeftSeconds(0);
      return;
    }

    const updateTime = () => {
      const deadline = new Date(expiredAt).getTime();
      if (Number.isNaN(deadline)) {
        setTimeLeftSeconds(0);
        return;
      }

      const now = Date.now();
      const diff = Math.floor((deadline - now) / 1000);
      setTimeLeftSeconds(Math.max(diff, 0));
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);

    return () => clearInterval(timer);
  }, [expiredAt]);

  const addOnSummary = useMemo(() => {
    if (!summary || summary.addOns.length === 0) {
      return "+0 orang";
    }

    const totalQty = summary.addOns.reduce((sum, item) => sum + item.quantity, 0);
    return `+${totalQty} orang`;
  }, [summary]);

  const isPaid =
    summary?.payment?.status === "paid" || summary?.status === "confirmed" || summary?.status === "completed";

  const handleCheckPayment = async () => {
    setCheckingPayment(true);
    setMessage(null);

    try {
      const latest = await refreshSummary();
      const paid =
        latest.payment?.status === "paid" || latest.status === "confirmed" || latest.status === "completed";

      if (paid) {
        router.push(`/booking/status?bookingId=${encodeURIComponent(bookingId)}`);
        return;
      }

      setMessage("Pembayaran belum terkonfirmasi. Silakan scan QR dan cek ulang beberapa detik lagi.");
    } catch (error: unknown) {
      setMessage((error as { message?: string })?.message || "Gagal mengecek status pembayaran");
    } finally {
      setCheckingPayment(false);
    }
  };

  const handleBack = () => {
    const params = new URLSearchParams({
      ...(bookingId ? { bookingId } : {}),
    });

    router.push(`/booking/method?${params.toString()}`);
  };

  return (
    <div className={`${monserratFont.className} bg-[#EFEFEF] text-[#0B1957]`}>
      <div className="fixed top-0 w-full z-50">
        <NavigationBar />
      </div>

      <main className="min-h-screen p-20 pt-35">
        <div className="mx-auto max-w-[980px]">
          <div className="flex justify-center">
            <div className="flex gap-x-3">
              <div className="h-2 w-10 rounded-full bg-[#FA9EBC]" />
              <div className="h-2 w-10 rounded-full bg-[#FA9EBC]" />
              <div className="h-2 w-10 rounded-full bg-[#FA9EBC]" />
              <div className="h-2 w-10 rounded-full bg-[#FA9EBC]" />
              <div className="h-2 w-10 rounded-full bg-[#FA9EBC]" />
              <div className="h-2 w-10 rounded-full bg-[#9B9B9B]" />
            </div>
          </div>

          <p className="mt-10 mb-4 text-center text-2xl text-[#515151]">Selesaikan pembayaran dalam</p>

          <div className="mt-4 flex justify-center">
            <div className="flex items-center gap-3 rounded-xl bg-[#0B1957] px-7 py-3 text-[#FA9EBC]">
              <FiClock className="text-xl" />
              <span className="text-xl font-semibold leading-none">{formatCountdown(timeLeftSeconds)}</span>
            </div>
          </div>

          {message && (
            <div className="mx-auto mt-6 max-w-[760] rounded-xl border border-[#FA9EBC] bg-[#fdebf2] px-5 py-4 text-[#B33362]">
              {message}
            </div>
          )}

          <section className="mx-auto mt-7 w-full max-w-[760] rounded-[20px] bg-[#EECFDB] px-8 py-8">
            <div className="flex justify-center">
              <div className="rounded-[20px] bg-[#F5F5F5] p-5 shadow-[0_6px_14px_rgba(15,24,63,0.2)]">
                {activeMethod === "qris" && qrImageUrl ? (
                  <img src={qrImageUrl} alt="QR pembayaran" className="h-50 w-50" />
                ) : (
                  <div className="flex h-100 w-100 items-center justify-center text-center text-xl text-[#666]">
                    Metode ini tidak menggunakan QR
                  </div>
                )}
              </div>
            </div>

            {activeMethod === "qris" && qrImageUrl && (
              <div className="mt-4 text-center text-lg underline text-[#0B1957]">
                <a href={qrImageUrl} target="_blank" rel="noreferrer" download>
                  Unduh QR Disini
                </a>
              </div>
            )}

            <div className="mt-6 rounded-xl bg-[#F5F5F5] px-6 py-6">
              <p className="text-3xl font-semibold text-[#515151]">RINGKASAN PESANAN</p>

              {loadingSummary || !summary ? (
                <p className="mt-10 text-xl text-[#666]">Memuat ringkasan...</p>
              ) : (
                <>
                  <span>
                    <p className="mt-10 text-2xl font-semibold">{summary.package.name}</p>
                    <p className="mt-1 text-2xl text-[#666]">{addOnSummary}</p>
                  </span>

                  <div className="mt-4 border-t border-[#D4D4D4]" />

                  <div className="mt-4 flex items-center justify-between gap-4">
                    <p className="text-2xl">Total Pembayaran</p>
                    <p className="text-2xl font-semibold">{formatRupiah(summary.pricing.totalPrice)}</p>
                  </div>
                </>
              )}
            </div>

            <div className="mt-8">
              <p className="text-xl font-semibold text-[#515151]">Cara Membayar</p>
              <div className="mt-3 space-y-3 text-lg text-[#0B1957]">
                <div className="flex flex-col gap-y-4">
                  <p className="flex flex-row gap-x-2 items-center">
                    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0B1957] text-sm font-semibold text-white">1</span>
                    <span>Buka aplikasi mobile banking atau e-wallet (GoPay, OVO, dll).</span>
                  </p>
                  <p className="flex flex-row gap-x-2 items-center">
                    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0B1957] text-sm font-semibold text-white">2</span>
                    <span>Pilih menu Scan/Bayar dan arahkan ke kode QR di atas.</span>
                  </p>
                  <p className="flex flex-row gap-x-2 items-center">
                    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0B1957] text-sm font-semibold text-white">3</span>
                    <span>Periksa detail transaksi, lalu konfirmasi pembayaran Anda.</span>
                  </p>
                </div>
              </div>
            </div>
          </section>

          <div className="mt-20 flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="flex flex-row items-center gap-x-2 text-xl p-2 border-2 border-[#FA9EBC] rounded-xl pl-6 pr-6"
            >
              <IoArrowBack />
              <span>Kembali</span>
            </button>

            <button
              type="button"
              onClick={handleCheckPayment}
              disabled={checkingPayment || loadingSummary}
              className={`flex flex-row items-center gap-x-2 text-xl p-2 border-2 border-[#FA9EBC] rounded-xl pl-6 pr-6${
                checkingPayment || loadingSummary
                  ? "cursor-not-allowed bg-[#f0bfd1] text-[#6e6e6e]"
                  : "bg-[#FA9EBC] text-[#0B1957] hover:opacity-90"
              }`}
            >
              <span>{checkingPayment ? "Mengecek..." : "Check Pembayaran"}</span>
              <IoIosArrowRoundForward className="text-3xl" />
            </button>
          </div>

          {isPaid && (
            <div className="mt-6 rounded-xl border border-[#7ec595] bg-[#eaf8ef] px-5 py-4 text-[#1f6a37]">
              Status pembayaran: BERHASIL. Ticket Anda siap dan invoice sudah dikirim ke email akun login.
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
