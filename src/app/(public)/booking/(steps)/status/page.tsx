"use client";

import Footer from "@/utility/footer";
import NavigationBar from "@/utility/navbar";
import { Montserrat } from "@/lib/font-fallback";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { IoCheckmark, IoLocationSharp } from "react-icons/io5";

const monserratFont = Montserrat({
  subsets: ["latin"],
  weight: "500",
});

const API_BASE_URL = process.env.NEXT_PUBLIC_API_PROXY_URL || "/api/proxy";
const ENV_AUTH_TOKEN = process.env.NEXT_PUBLIC_BOOKING_AUTH_TOKEN || "";

type TicketResponse = {
  data: {
    bookingId: string;
    bookingCode: string;
    status: string;
    customer: {
      name: string;
      phone: string;
    };
    package: {
      name: string;
      durationMinutes: number;
    };
    location: string;
    schedule: {
      date: string;
      startTime: string;
      endTime: string;
      studioName: string;
      studioType: string;
    };
    ticket: {
      id: string;
      qrCode: string;
      status: string;
      issuedAt: string;
      expiredAt: string;
    };
  };
};

function getClientAuthToken() {
  if (typeof window === "undefined") return ENV_AUTH_TOKEN;

  const fromStorage =
    window.localStorage.getItem("authToken") ||
    window.localStorage.getItem("token") ||
    window.localStorage.getItem("accessToken") ||
    "";

  return fromStorage || ENV_AUTH_TOKEN;
}

function formatBookingDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatBookingTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  return `${hours}.${minutes}`;
}

function StatusPageContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId") || "";

  const [ticketData, setTicketData] = useState<TicketResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const invoiceCardRef = useRef<HTMLElement | null>(null);
  const hasAutoSentEmailRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();

    const loadTicket = async () => {
      if (!bookingId) {
        setLoading(false);
        setMessage("bookingId tidak ditemukan. Silakan lanjut dari langkah pembayaran.");
        return;
      }

      const token = getClientAuthToken();
      if (!token) {
        setLoading(false);
        setMessage(
          "Butuh token login untuk memuat tiket. Set `NEXT_PUBLIC_BOOKING_AUTH_TOKEN` atau simpan token di localStorage (`authToken`)."
        );
        return;
      }

      setLoading(true);
      setMessage(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/ticket`, {
          method: "GET",
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const json = (await response.json()) as TicketResponse;

        if (!response.ok) {
          throw new Error((json as { message?: string })?.message || "Gagal memuat tiket booking");
        }

        setTicketData(json.data);
      } catch (error: unknown) {
        if ((error as { name?: string })?.name !== "AbortError") {
          setMessage((error as { message?: string })?.message || "Gagal memuat tiket booking");
          setTicketData(null);
        }
      } finally {
        setLoading(false);
      }
    };

    void loadTicket();

    return () => controller.abort();
  }, [bookingId]);

  const ticketQrImage = useMemo(() => {
    if (!ticketData?.ticket?.qrCode) return "";
    return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=0&data=${encodeURIComponent(ticketData.ticket.qrCode)}`;
  }, [ticketData]);

  const handleSendInvoiceEmail = async () => {
    if (!bookingId) {
      setMessage("bookingId tidak ditemukan.");
      return;
    }

    const token = getClientAuthToken();
    if (!token) {
      setMessage("Token login tidak ditemukan.");
      return;
    }

    setSendingEmail(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/ticket/send-email`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = (await response.json()) as { message?: string; data?: { email?: string } };
      if (!response.ok) {
        throw new Error(json.message || "Gagal mengirim invoice ke email");
      }

      const targetEmail = json.data?.email || "email akun Anda";
      setMessage(`Invoice berhasil dikirim ke ${targetEmail}.`);
    } catch (error: unknown) {
      setMessage((error as { message?: string })?.message || "Gagal mengirim invoice ke email");
    } finally {
      setSendingEmail(false);
    }
  };

  useEffect(() => {
    if (loading || !ticketData || !bookingId || hasAutoSentEmailRef.current) {
      return;
    }

    const sentKey = `ticket_invoice_sent:${bookingId}`;
    if (typeof window !== "undefined" && window.localStorage.getItem(sentKey) === "1") {
      hasAutoSentEmailRef.current = true;
      return;
    }

    hasAutoSentEmailRef.current = true;
    void (async () => {
      await handleSendInvoiceEmail();
      if (typeof window !== "undefined") {
        window.localStorage.setItem(sentKey, "1");
      }
    })();
  }, [loading, ticketData, bookingId]);

  const handleDownloadImage = () => {
    if (!ticketData) return;

    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 1600;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#EECFDB";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#0B1957";
    ctx.fillRect(0, 0, canvas.width, 190);

    ctx.fillStyle = "#FA9EBC";
    ctx.font = "500 36px Arial";
    ctx.fillText("NOMOR PESANAN", 70, 75);
    ctx.font = "700 58px Arial";
    ctx.fillText(ticketData.bookingCode, 70, 145);

    ctx.fillStyle = "#0B1957";
    ctx.font = "600 42px Arial";
    ctx.fillText("INVOICE TIKET PHOTOSCAPE", 70, 270);

    ctx.font = "400 34px Arial";
    const lines = [
      `Nama: ${ticketData.customer.name}`,
      `No. HP: ${ticketData.customer.phone}`,
      `Paket: ${ticketData.package.name}`,
      `Durasi: ${ticketData.package.durationMinutes} menit`,
      `Tanggal: ${formatBookingDate(ticketData.schedule.date)}`,
      `Waktu: ${formatBookingTime(ticketData.schedule.startTime)}`,
      `Lokasi: ${ticketData.location}`,
      `QR Value: ${ticketData.ticket.qrCode}`,
    ];

    lines.forEach((line, index) => {
      ctx.fillText(line, 70, 360 + index * 62);
    });

    if (ticketQrImage) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.fillStyle = "#F5F5F5";
        ctx.fillRect(340, 930, 520, 520);
        ctx.drawImage(img, 380, 970, 440, 440);
        const dataUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `invoice-${ticketData.bookingCode}.png`;
        link.click();
      };
      img.onerror = () => {
        const dataUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `invoice-${ticketData.bookingCode}.png`;
        link.click();
      };
      img.src = ticketQrImage;
      return;
    }

    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `invoice-${ticketData.bookingCode}.png`;
    link.click();
  };

  const handleDownloadPdf = () => {
    const element = invoiceCardRef.current;
    if (!element || !ticketData) return;

    const printable = window.open("", "_blank", "width=900,height=1200");
    if (!printable) return;

    printable.document.write(`
      <html>
        <head>
          <title>Invoice ${ticketData.bookingCode}</title>
          <style>
            body { font-family: Arial, sans-serif; background:#EFEFEF; padding: 24px; }
            .note { margin-bottom: 16px; color:#555; }
            .wrap { max-width: 760px; margin: 0 auto; }
          </style>
        </head>
        <body>
          <div class="wrap">
            <div class="note">Pilih \"Save as PDF\" di dialog print untuk unduh PDF.</div>
            ${element.outerHTML}
          </div>
        </body>
      </html>
    `);
    printable.document.close();
    printable.focus();
    printable.print();
  };

  return (
    <div className={`${monserratFont.className} bg-[#EFEFEF] text-[#0B1957]`}>
      <div className="fixed top-0 w-full z-50">
        <NavigationBar />
      </div>

      <main className="min-h-screen px-4 pb-20 pt-28 sm:px-8 sm:pb-24 sm:pt-32 lg:px-10 lg:pt-35">
        <div className="mx-auto max-w-900">
          <div className="mb-10 flex justify-center">
            <div className="flex gap-x-3">
              <div className="w-7 h-2 bg-[#FA9EBC] rounded-full" />
              <div className="w-7 h-2 bg-[#FA9EBC] rounded-full" />
              <div className="w-7 h-2 bg-[#FA9EBC] rounded-full" />
              <div className="w-7 h-2 bg-[#FA9EBC] rounded-full" />
              <div className="w-7 h-2 bg-[#FA9EBC] rounded-full" />
              <div className="w-7 h-2 bg-[#FA9EBC] rounded-full" /> 
            </div>
          </div>

          <div className="mb-6 flex justify-center">
            <div className="flex h-13 w-13 items-center justify-center rounded-full bg-[#FA9EBC] text-[#0B1957]">
              <IoCheckmark className="text-3xl" />
            </div>
          </div>

          <h1 className="text-center text-2xl font-semibold leading-none sm:text-3xl lg:text-4xl">Pembayaran Berhasil!</h1>
          <p className="mt-3 text-center text-base text-[#666] sm:mt-4 sm:text-xl">
            Terima kasih telah mempercayakan momen Anda <br />
            bersama Photoscape.
          </p>

          {message && (
            <div className="mx-auto mt-8 flex w-full max-w-[680px] items-center justify-center rounded-xl border border-[#FA9EBC] bg-[#fdebf2] px-5 py-4 text-[18px] leading-relaxed text-[#B33362] break-words text-center">
              {message}
            </div>
          )}

          <section ref={invoiceCardRef} className="relative mx-auto mt-8 w-full max-w-[680px] overflow-hidden rounded-[20px] bg-[#EECFDB]">
            <div className="bg-[#0B1957] px-5 py-5 text-white sm:px-8 sm:py-6">
              <p className="text-lg mb-2 uppercase tracking-wide text-[#FA9EBC]">Nomor Pesanan</p>
              <p className="text-3xl font-semibold leading-none text-[#FA9EBC]">
                {ticketData?.bookingCode || (loading ? "Memuat..." : "-")}
              </p>
            </div>

            <div className="px-4 pb-6 pt-5 sm:px-8 sm:pb-8 sm:pt-7">
              {loading && !ticketData ? (
                <p className="text-xl text-[#666] sm:text-[32px]">Memuat tiket...</p>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-x-7 gap-y-5 text-[#0B1957] sm:grid-cols-2 sm:gap-y-7">
                    <div>
                      <p className="text-base text-[#666] sm:text-xl">Nama</p>
                      <p className="text-xl font-semibold sm:text-3xl">{ticketData?.customer.name || "-"}</p>
                    </div>
                    <div>
                      <p className="text-base text-[#666] sm:text-xl">No. HP</p>
                      <p className="text-xl font-semibold sm:text-3xl">{ticketData?.customer.phone || "-"}</p>
                    </div>
                    <div>
                      <p className="text-base text-[#666] sm:text-xl">Nama Paket</p>
                      <p className="text-xl font-semibold sm:text-3xl">{ticketData?.package.name || "-"}</p>
                    </div>
                    <div>
                      <p className="text-base text-[#666] sm:text-xl">Durasi</p>
                      <p className="text-xl font-semibold sm:text-3xl">{ticketData ? `${ticketData.package.durationMinutes} menit` : "-"}</p>
                    </div>
                    <div>
                      <p className="text-base text-[#666] sm:text-xl">Tanggal</p>
                      <p className="text-xl font-semibold sm:text-3xl">
                        {ticketData ? formatBookingDate(ticketData.schedule.date) : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-base text-[#666] sm:text-[26px]">Waktu</p>
                      <p className="text-xl font-semibold sm:text-3xl">
                        {ticketData ? formatBookingTime(ticketData.schedule.startTime) : "-"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-10 border-t border-dashed  border-[#bfa9b3] pt-4">
                    <div className="mt-1 lex items-start gap-2 text-[#0B1957]">
                      <div>
                        <p className="text-base text-[#666] sm:text-[24px]">Lokasi Studio</p>
                        <p className="text-2xl font-semibold sm:text-[38px]">{ticketData?.location || "-"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="relative mt-6 border-t-3 border-dashed border-[#b39ba5] pt-7">
                    <div className="absolute -left-12 -top-3.5 h-7 w-7 rounded-full bg-[#EFEFEF]" />
                    <div className="absolute -right-12 -top-3.5 h-7 w-7 rounded-full bg-[#EFEFEF]" />

                    <div className="flex justify-center">
                      <div className="rounded-xl bg-[#F5F5F5] p-3 shadow-[0_6px_14px_rgba(15,24,63,0.18)] sm:p-4">
                        {ticketQrImage ? (
                          <img src={ticketQrImage} alt="QR Tiket Booking" className="h-40 w-40 sm:h-50 sm:w-50" />
                        ) : (
                          <div className="flex h-40 w-40 items-center justify-center text-center text-sm text-[#666] sm:h-50 sm:w-50 sm:text-lg">
                            QR tiket belum tersedia
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="mt-6 text-center text-sm italic text-[#6a6a6a] sm:mt-8 sm:text-xl">
                      Tunjukkan kode QR ini kepada admin saat tiba di studio.
                    </p>
                  </div>
                </>
              )}
            </div>
          </section>

          <div className="mx-auto mt-8 flex items-center justify-center max-w-[680px] flex-wrap gap-3">
            <button
              type="button"
              onClick={handleDownloadImage}
              disabled={loading || !ticketData}
              className={`rounded-xl px-5 py-2 text-[18px] font-semibold ${
                loading || !ticketData
                  ? "cursor-not-allowed bg-[#f0bfd1] text-[#6e6e6e]"
                  : "bg-[#FA9EBC] text-[#0B1957] hover:opacity-90"
              }`}
            >
              Unduh Gambar
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function StatusPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#EFEFEF]" />}>
      <StatusPageContent />
    </Suspense>
  );
}
