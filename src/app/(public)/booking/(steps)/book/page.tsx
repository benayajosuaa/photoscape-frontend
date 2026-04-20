"use client";
import Footer from "@/utility/footer";
import NavigationBar from "@/utility/navbar";
import { IoIosArrowRoundForward } from "react-icons/io";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Montserrat } from "@/lib/font-fallback";

const monserratFont = Montserrat({
  subsets: ["latin"],
  weight: "500",
});

const API_BASE_URL = process.env.NEXT_PUBLIC_API_PROXY_URL || "/api/proxy";

type Location = {
  id: string;
  name: string;
};

type MetaResponse = {
  data: {
    locations: Location[];
  };
};

function BookPageContent() {
  const searchParams = useSearchParams();
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token =
      window.localStorage.getItem("authToken") ||
      window.localStorage.getItem("token") ||
      window.localStorage.getItem("accessToken") ||
      "";

    if (!token) {
      const redirect = encodeURIComponent(`/booking/book${window.location.search || ""}`);
      router.replace(`/login?redirect=${redirect}`);
      return;
    }

    setIsAuthenticated(true);
    setIsAuthChecked(true);
  }, [router]);

  useEffect(() => {
    setCustomerName(searchParams.get("customerName") || "");
    setCustomerPhone(searchParams.get("customerPhone") || "");
  }, [searchParams]);

  useEffect(() => {
    if (!isAuthChecked || !isAuthenticated) {
      return;
    }

    const controller = new AbortController();

    const loadLocations = async () => {
      setLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/bookings/meta`, {
          method: "GET",
          signal: controller.signal,
        });
        const json = (await response.json()) as MetaResponse;

        if (!response.ok) {
          throw new Error((json as any)?.message || "Gagal memuat lokasi");
        }

        const fetchedLocations = json.data.locations ?? [];
        setLocations(fetchedLocations);

        const queryLocationId = searchParams.get("locationId") || "";
        const queryCity = searchParams.get("city") || "";
        const byCity = fetchedLocations.find(
          location => location.name.toLowerCase() === queryCity.toLowerCase()
        );
        const resolvedLocationId =
          fetchedLocations.find(location => location.id === queryLocationId)?.id || byCity?.id || null;
        setSelectedLocationId(resolvedLocationId);
      } catch (error: any) {
        if (error.name !== "AbortError") {
          setErrorMessage(error.message || "Gagal memuat lokasi");
        }
      } finally {
        setLoading(false);
      }
    };

    void loadLocations();

    return () => controller.abort();
  }, [searchParams, isAuthChecked, isAuthenticated]);

  const selectedLocation = useMemo(
    () => locations.find(location => location.id === selectedLocationId) ?? null,
    [locations, selectedLocationId]
  );

  const canContinue =
    Boolean(selectedLocationId) &&
    customerName.trim().length >= 2 &&
    customerPhone.trim().length >= 8;

  return (
    <div className={`${monserratFont.className} bg-white text-gray-900`}>
      <div className="fixed top-0 w-full z-50">
        <NavigationBar />
      </div>

      <div className="min-h-screen px-4 pt-28 sm:px-8 lg:px-20 lg:pt-32">
        {!isAuthChecked ? (
          <div className="py-20 text-center text-xl text-[#666]">Mengecek sesi login...</div>
        ) : (
        <div className="flex flex-col gap-y-16">
          <div className="flex justify-center py-2 sm:py-4">
            <span className="text-center text-base text-[#515151] sm:text-xl">
              Abadikan momen terbaik Anda hari ini. <br />
              Pesan sesi foto Anda sekarang!
            </span>
          </div>

          <div className="flex justify-center items-center">
            <div className="flex flex-row gap-x-3">
              <div className="border-2 w-7 rounded-2xl text-[#FA9EBC]" />
              <div className="border-2 w-7 rounded-2xl text-[#969696]" />
              <div className="border-2 w-7 rounded-2xl text-[#969696]" />
              <div className="border-2 w-7 rounded-2xl text-[#969696]" />
              <div className="border-2 w-7 rounded-2xl text-[#969696]" />
              <div className="border-2 w-7 rounded-2xl text-[#969696]" />
            </div>
          </div>

          <div className="flex w-full flex-col gap-10 p-2 sm:p-6 lg:flex-row lg:p-10">
            <div className="w-full lg:w-1/2">
              <div className="flex flex-col gap-y-10 max-w-md">
                <div className="flex flex-col gap-y-2">
                  <label className="text-lg font-semibold text-blue-900 sm:text-xl">Name</label>
                  <input
                    type="text"
                    placeholder="Enter Name"
                    value={customerName}
                    onChange={event => setCustomerName(event.target.value)}
                    className="border-b p-2 border-gray-400 w-full focus:outline-none focus:border-blue-500 text-gray-600"
                  />
                </div>

                <div className="flex flex-col gap-y-2">
                  <label className="text-lg font-semibold text-blue-900 sm:text-xl">Phone</label>
                  <input
                    type="tel"
                    placeholder="Enter Phone Number"
                    value={customerPhone}
                    onChange={event => setCustomerPhone(event.target.value)}
                    className="border-b p-2 border-gray-400 w-full focus:outline-none focus:border-blue-500 text-gray-600"
                  />
                </div>
              </div>
            </div>

            <div className="w-full lg:w-1/2">
              <div className="flex flex-col gap-y-8">
                <h1 className="text-2xl font-bold sm:text-3xl">Pilih Lokasi</h1>

                {errorMessage && <p className="text-sm text-[#B33362]">{errorMessage}</p>}

                <div className="flex gap-x-6 flex-wrap gap-y-3">
                  {(loading ? [] : locations).map(location => {
                    const isActive = selectedLocationId === location.id;

                    return (
                      <button
                        key={location.id}
                        onClick={() => setSelectedLocationId(isActive ? null : location.id)}
                        className={`px-6 py-2 rounded-xl border-2 transition ${
                          isActive
                            ? "bg-[#0B1957] text-[#FA9EBC] border-[#0B1957]"
                            : "bg-[#F8C6D673] text-[#0B1957] border-[#0B1957] hover:bg-[#0B1957] hover:text-[#FA9EBC]"
                        }`}
                        disabled={loading}
                      >
                        {location.name}
                      </button>
                    );
                  })}
                </div>

                {selectedLocation && (
                  <p className="text-sm text-gray-600">
                    Lokasi dipilih: <span className="font-semibold">{selectedLocation.name}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <button
              disabled={!canContinue}
              onClick={() => {
                if (selectedLocation) {
                  const query = new URLSearchParams({
                    locationId: selectedLocation.id,
                    city: selectedLocation.name,
                    customerName: customerName.trim(),
                    customerPhone: customerPhone.trim(),
                  });
                  router.push(`/booking/package?${query.toString()}`);
                }
              }}
              className={`flex items-center gap-x-2 px-8 py-2 rounded-lg transition ${
                canContinue
                  ? "bg-[#FA9EBC] text-[#0B1957] hover:opacity-90"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <span className="text-xl">Lanjut</span>
              <span className="text-3xl">
                <IoIosArrowRoundForward />
              </span>
            </button>
          </div>
        </div>
        )}
      </div>

      <div>
        <div>
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <BookPageContent />
    </Suspense>
  );
}
