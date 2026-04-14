"use client";
import Footer from "@/utility/footer";
import NavigationBar from "@/utility/navbar";
import { IoIosArrowRoundForward } from "react-icons/io";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Montserrat } from "next/font/google";

const monserratFont = Montserrat({
  subsets: ["latin"],
  weight: "500",
});

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

type Location = {
  id: string;
  name: string;
};

type MetaResponse = {
  data: {
    locations: Location[];
  };
};

export default function Home() {
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
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
  }, []);

  const selectedLocation = useMemo(
    () => locations.find(location => location.id === selectedLocationId) ?? null,
    [locations, selectedLocationId]
  );

  return (
    <div className={`${monserratFont.className} bg-white text-gray-900`}>
      <div className="fixed top-0 w-full z-50">
        <NavigationBar />
      </div>

      <div className="min-h-screen pt-32 px-20">
        <div className="flex flex-col gap-y-16">
          <div className="flex justify-center py-4">
            <span className="text-center text-xl text-[#515151]">
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

          <div className="flex w-full p-10">
            <div className="w-1/2">
              <div className="flex flex-col gap-y-10 max-w-md">
                <div className="flex flex-col gap-y-2">
                  <label className="text-xl font-semibold text-blue-900">Name</label>
                  <input
                    type="text"
                    placeholder="Enter Name"
                    className="border-b p-2 border-gray-400 w-full focus:outline-none focus:border-blue-500 text-gray-600"
                  />
                </div>

                <div className="flex flex-col gap-y-2">
                  <label className="text-xl font-semibold text-blue-900">Email</label>
                  <input
                    type="email"
                    placeholder="Enter Email"
                    className="border-b p-2 border-gray-400 w-full focus:outline-none focus:border-blue-500 text-gray-600"
                  />
                </div>
              </div>
            </div>

            <div className="w-1/2">
              <div className="flex flex-col gap-y-8">
                <h1 className="text-3xl font-bold">Pilih Lokasi</h1>

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

          <div className="flex justify-end">
            <button
              disabled={!selectedLocationId}
              onClick={() => {
                if (selectedLocation) {
                  const query = new URLSearchParams({
                    locationId: selectedLocation.id,
                    city: selectedLocation.name,
                  });
                  router.push(`/booking/package?${query.toString()}`);
                }
              }}
              className={`flex items-center gap-x-2 px-8 py-2 rounded-lg transition ${
                selectedLocationId
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
      </div>

      <div>
        <div>
          <Footer />
        </div>
      </div>
    </div>
  );
}
