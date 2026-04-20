"use client";

import Footer from "@/utility/footer";
import NavigationBar from "@/utility/navbar";
import { Montserrat } from "@/lib/font-fallback";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL, getStoredToken } from "@/lib/auth-client";

const monserratFont = Montserrat({
  subsets: ["latin"],
  weight: "500",
});

type BookingHistoryResponse = {
  data: {
    history: Array<{
      bookingId: string;
      bookingCode: string;
      status: string;
      createdAt: string;
      location: string;
      package: {
        name: string;
        durationMinutes: number;
      };
      pricing: {
        addOnTotal: number;
        totalPrice: number;
      };
      payment: {
        status: string;
        method: string;
        amount: number;
        paidAt: string | null;
      } | null;
      ticket: {
        id: string;
        status: string;
        qrCode: string;
      } | null;
      schedule: {
        date: string;
        startTime: string;
        endTime: string;
        studioName: string;
      };
    }>;
    summary: {
      totalBookings: number;
      paidBookings: number;
      totalSpent: number;
    };
  };
};

function formatRupiah(value: number) {
  return `Rp ${new Intl.NumberFormat("id-ID").format(value)}`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  return `${hh}.${mm}`;
}

export default function BookingHistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<BookingHistoryResponse["data"] | null>(null);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      router.replace(`/login?redirect=${encodeURIComponent("/booking/history")}`);
      return;
    }

    const controller = new AbortController();

    const loadHistory = async () => {
      setLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/bookings/history`, {
          method: "GET",
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const json = (await response.json()) as BookingHistoryResponse;

        if (!response.ok) {
          throw new Error((json as { message?: string })?.message || "Gagal memuat riwayat booking");
        }

        setHistoryData(json.data);
      } catch (error: unknown) {
        if ((error as { name?: string })?.name !== "AbortError") {
          setErrorMessage((error as { message?: string })?.message || "Gagal memuat riwayat booking");
        }
      } finally {
        setLoading(false);
      }
    };

    void loadHistory();

    return () => controller.abort();
  }, [router]);

  const summary = useMemo(() => historyData?.summary, [historyData]);

  return (
    <div className={`${monserratFont.className} bg-[#EFEFEF] text-[#0B1957]`}>
      <div className="fixed top-0 z-50 w-full">
        <NavigationBar />
      </div>

      <main className="min-h-screen px-4 pb-20 pt-28 sm:px-8 sm:pb-24 sm:pt-32 lg:px-20 lg:pt-36">
        <div className="mx-auto max-w-[1080px]">
          <h1 className="text-[28px] font-semibold leading-none sm:text-[36px] lg:text-[42px]">Riwayat Booking</h1>

          {summary && (
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-white px-5 py-4 shadow-sm">
                <p className="text-[16px] text-[#666]">Total Booking</p>
                <p className="text-[24px] font-semibold sm:text-[30px]">{summary.totalBookings}</p>
              </div>
              <div className="rounded-xl bg-white px-5 py-4 shadow-sm">
                <p className="text-[16px] text-[#666]">Booking Paid</p>
                <p className="text-[24px] font-semibold sm:text-[30px]">{summary.paidBookings}</p>
              </div>
              <div className="rounded-xl bg-white px-5 py-4 shadow-sm">
                <p className="text-[16px] text-[#666]">Total Money Spent</p>
                <p className="text-[24px] font-semibold sm:text-[30px]">{formatRupiah(summary.totalSpent)}</p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mt-6 rounded-xl border border-[#FA9EBC] bg-[#fdebf2] px-5 py-4 text-[#B33362]">{errorMessage}</div>
          )}

          <div className="mt-6 space-y-4">
            {loading ? (
              <div className="rounded-xl bg-white px-5 py-4 text-[#666]">Memuat riwayat...</div>
            ) : historyData && historyData.history.length === 0 ? (
              <div className="rounded-xl bg-white px-5 py-4 text-[#666]">Belum ada riwayat booking.</div>
            ) : (
              historyData?.history.map(item => (
                <div key={item.bookingId} className="rounded-2xl bg-white px-6 py-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[14px] text-[#666]">Nomor Pesanan</p>
                      <p className="text-[22px] font-semibold leading-none sm:text-[28px]">{item.bookingCode}</p>
                    </div>
                    <span className="rounded-full bg-[#fdebf2] px-3 py-1 text-[13px] font-semibold text-[#B33362]">
                      {item.payment?.status ?? item.status}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 text-[15px] text-[#223] md:grid-cols-2">
                    <p>
                      Paket: <span className="font-semibold">{item.package.name}</span>
                    </p>
                    <p>
                      Lokasi: <span className="font-semibold">{item.location}</span>
                    </p>
                    <p>
                      Jadwal: <span className="font-semibold">{formatDate(item.schedule.date)} · {formatTime(item.schedule.startTime)}</span>
                    </p>
                    <p>
                      Total: <span className="font-semibold">{formatRupiah(item.pricing.totalPrice)}</span>
                    </p>
                    <p>
                      Metode Bayar: <span className="font-semibold">{item.payment?.method ?? "-"}</span>
                    </p>
                    <p>
                      Ticket: <span className="font-semibold">{item.ticket ? "Tersedia" : "Belum ada"}</span>
                    </p>
                  </div>

                  {item.ticket && (
                    <div className="mt-4 border-t border-dashed pt-4">
                      <p className="text-[13px] text-[#666]">QR Ticket</p>
                      <p className="truncate text-[14px] font-semibold">{item.ticket.qrCode}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
