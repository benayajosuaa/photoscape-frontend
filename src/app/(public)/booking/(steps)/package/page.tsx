"use client";

import Footer from "@/utility/footer";
import NavigationBar from "@/utility/navbar";
import { IoArrowBack } from "react-icons/io5";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Montserrat } from "next/font/google";
import { IoIosArrowRoundForward } from "react-icons/io";
import { FiPlus, FiCheck } from "react-icons/fi";

const monserratFont = Montserrat({
  subsets: ["latin"],
  weight: "500",
});

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

type PackageType = "studio" | "photobox" | "selfphoto";

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

type BookingStudio = {
  id: string;
  name: string;
  type: string;
  capacity: number;
};

type MetaResponse = {
  data: {
    locations: BookingLocation[];
    studios: BookingStudio[];
    packages: BookingPackage[];
    addOns: BookingAddOn[];
  };
};

const TAB_TO_STUDIO_TYPE: Record<PackageType, string[]> = {
  studio: ["K1", "K2"],
  selfphoto: ["SELF_PHOTO"],
  photobox: ["PHOTO_BOX"],
};

const TAB_TITLE: Record<PackageType, string> = {
  studio: "Photo Studio",
  selfphoto: "Self Photo",
  photobox: "Photobox",
};

function inferPackageTypeFromName(name: string): PackageType | null {
  const normalized = name.toLowerCase();

  if (normalized.includes("family")) return "studio";
  if (normalized.includes("self photo") || normalized.includes("selfphoto") || normalized.includes("group")) {
    return "selfphoto";
  }
  if (normalized.includes("photo box") || normalized.includes("photobox")) return "photobox";

  return null;
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

export default function PackagePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isHydrated, setIsHydrated] = useState(false);

  const [activeTab, setActiveTab] = useState<PackageType>("studio");
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [selectedStudioType, setSelectedStudioType] = useState("");

  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [selectedAddOns, setSelectedAddOns] = useState<Record<string, number>>({});

  const [locations, setLocations] = useState<BookingLocation[]>([]);
  const [studios, setStudios] = useState<BookingStudio[]>([]);
  const [packages, setPackages] = useState<BookingPackage[]>([]);
  const [addOns, setAddOns] = useState<BookingAddOn[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const availableStudioTypes = useMemo(() => {
    const allowedTypes = TAB_TO_STUDIO_TYPE[activeTab];
    const fromBackend = [...new Set(studios.map(item => item.type))];
    return allowedTypes.filter(type => fromBackend.includes(type));
  }, [activeTab, studios]);

  useEffect(() => {
    const controller = new AbortController();

    const loadMeta = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/bookings/meta`, {
          method: "GET",
          signal: controller.signal,
        });

        const json = (await response.json()) as MetaResponse;

        if (!response.ok) {
          throw new Error((json as any)?.message || "Gagal memuat data booking");
        }

        const fetchedLocations = json.data.locations ?? [];
        const fetchedStudios = json.data.studios ?? [];
        const fetchedPackages = json.data.packages ?? [];
        const fetchedAddOns = json.data.addOns ?? [];

        setLocations(fetchedLocations);
        setStudios(fetchedStudios);
        setPackages(fetchedPackages);
        setAddOns(fetchedAddOns);

        const queryLocationId = searchParams.get("locationId") || "";
        const queryCity = searchParams.get("city") || "";
        const queryStudioType = searchParams.get("studioType") || "";
        const queryPackageId = searchParams.get("packageId") || "";
        const queryAddOns = searchParams.get("addOns") || "";

        const locationByCity = fetchedLocations.find(
          item => item.name.toLowerCase() === queryCity.toLowerCase()
        );

        const resolvedLocationId =
          fetchedLocations.find(item => item.id === queryLocationId)?.id ||
          locationByCity?.id ||
          fetchedLocations[0]?.id ||
          "";

        setSelectedLocationId(resolvedLocationId);
        setSelectedPackageId(
          fetchedPackages.find(item => item.id === queryPackageId)?.id || ""
        );

        if (queryAddOns) {
          const parsedAddOns = queryAddOns.split(",").reduce<Record<string, number>>((acc, pair) => {
            const [id, qtyRaw] = pair.split(":");
            const qty = Number(qtyRaw);
            if (id && Number.isInteger(qty) && qty > 0) {
              acc[id] = qty;
            }
            return acc;
          }, {});
          setSelectedAddOns(parsedAddOns);
        } else {
          setSelectedAddOns({});
        }

        if (queryStudioType === "SELF_PHOTO") {
          setActiveTab("selfphoto");
        } else if (queryStudioType === "PHOTO_BOX") {
          setActiveTab("photobox");
        } else {
          setActiveTab("studio");
        }
      } catch (error: any) {
        if (error.name !== "AbortError") {
          setErrorMessage(error.message || "Gagal memuat data booking");
        }
      } finally {
        setIsLoading(false);
      }
    };

    void loadMeta();

    return () => controller.abort();
  }, [searchParams]);

  useEffect(() => {
    if (availableStudioTypes.length === 0) {
      setSelectedStudioType("");
      return;
    }

    setSelectedStudioType(prev => (availableStudioTypes.includes(prev) ? prev : availableStudioTypes[0]));
  }, [availableStudioTypes]);

  const handleAdd = (addOnId: string) => {
    setSelectedAddOns(prev => ({
      ...prev,
      [addOnId]: (prev[addOnId] || 0) + 1,
    }));
  };

  const handleMinus = (addOnId: string) => {
    setSelectedAddOns(prev => ({
      ...prev,
      [addOnId]: Math.max((prev[addOnId] || 0) - 1, 0),
    }));
  };

  const selectedPackage = packages.find(item => item.id === selectedPackageId) ?? null;
  const selectedLocation = locations.find(item => item.id === selectedLocationId) ?? null;
  const filteredPackages = useMemo(
    () =>
      packages.filter(item => {
        const inferredType = inferPackageTypeFromName(item.name);
        return inferredType === activeTab;
      }),
    [packages, activeTab]
  );

  useEffect(() => {
    if (!selectedPackageId) return;

    const stillExistsInTab = filteredPackages.some(item => item.id === selectedPackageId);
    if (!stillExistsInTab) {
      setSelectedPackageId("");
    }
  }, [filteredPackages, selectedPackageId]);

  const handleNext = () => {
    if (!selectedPackage) {
      alert("Pilih paket dulu !");
      return;
    }

    if (!selectedLocationId) {
      alert("Pilih lokasi terlebih dahulu");
      return;
    }

    if (!selectedStudioType) {
      alert("Tipe studio belum tersedia untuk kategori ini");
      return;
    }

    const addOnsQuery = Object.entries(selectedAddOns)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => `${id}:${qty}`)
      .join(",");

    const nextParams = new URLSearchParams({
      locationId: selectedLocationId,
      ...(selectedLocation ? { city: selectedLocation.name } : {}),
      packageId: selectedPackage.id,
      studioType: selectedStudioType,
      ...(addOnsQuery ? { addOns: addOnsQuery } : {}),
    });

    router.push(`/booking/schedule?${nextParams.toString()}`);
  };

  return (
    <div className={`${monserratFont.className} bg-white text-gray-900`}>
      <div className="fixed top-0 w-full z-50">
        <NavigationBar />
      </div>

      <div className="min-h-screen pt-32 px-20">
        <div className="flex flex-col gap-y-16">
          <div className="flex justify-center">
            <div className="flex gap-x-3">
              <div className="w-7 h-2 bg-[#FA9EBC] rounded-full" />
              <div className="w-7 h-2 bg-[#FA9EBC] rounded-full" />
              <div className="w-7 h-2 bg-gray-300 rounded-full" />
              <div className="w-7 h-2 bg-gray-300 rounded-full" />
              <div className="w-7 h-2 bg-gray-300 rounded-full" />
              <div className="w-7 h-2 bg-gray-300 rounded-full" />
            </div>
          </div>

          <div className="flex flex-col gap-y-10">
            <h1 className="text-2xl text-[#0B1957] font-semibold">Pilih Kategori dan Paket</h1>

            {errorMessage && (
              <div className="rounded-xl border border-[#FA9EBC] bg-[#fdebf2] px-5 py-4 text-[#B33362]">
                {errorMessage}
              </div>
            )}

            
            <div className="flex gap-x-10 border-b text-xl">
              {(["studio", "selfphoto", "photobox"] as PackageType[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setSelectedPackageId("");
                  }}
                  className={`${
                    activeTab === tab
                      ? "border-b-3 border-[#FA9EBC] font-semibold text-[#0B1957]"
                      : "text-gray-400"
                  }`}
                >
                  {TAB_TITLE[tab]}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-6 min-h-64">
              {isLoading ? (
                <div className="text-lg text-gray-500">Memuat paket...</div>
              ) : filteredPackages.length === 0 ? (
                <div className="text-lg text-gray-500">Belum ada paket untuk kategori ini.</div>
              ) : (
                filteredPackages.map(item => {
                  const isSelected = selectedPackageId === item.id;

                  return (
                    <div
                      key={item.id}
                      className="text-2xl p-4 flex flex-row justify-between w-full border border-[#0B1957]  bg-[#F8C6D673] text-[#0B1957] rounded-2xl"
                    >
                      <div className="flex flex-row justify-between w-full gap-x-10 p-3 ">
                        <div className="flex flex-row justify-between w-full">
                          <div className="">
                            <h2 className="font-semibold">{item.name}</h2>
                            <p className="text-base text-[#374151] mt-1">
                              {item.durationMinutes} menit • Maks {item.maxCapacity} orang
                            </p>
                          </div>

                          <div className="flex flex-row gap-x-3 items-center font-semibold ">
                            <span className="text-xl font-medium">Rp</span>
                            <span>{formatRupiah(item.price)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div>
                            <button
                              onClick={() => setSelectedPackageId(isSelected ? "" : item.id)}
                              className={`w-10 h-10 rounded-full flex items-center font-bold transition-all justify-center ${
                                isSelected
                                  ? "bg-white text-[#0B1957] font-bold"
                                  : "bg-[#0B1957] text-white hover:scale-110 font-bold"
                              }`}
                            >
                              {isSelected ? <FiCheck size={20} /> : <FiPlus size={20} />}
                            </button>
                          </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div>
              <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-semibold text-[#0B1957]">Tambahan</h1>

                {isLoading ? (
                  <div className="text-lg text-gray-500">Memuat add-on...</div>
                ) : addOns.length === 0 ? (
                  <div className="text-lg text-gray-500">Belum ada add-on tersedia.</div>
                ) : (
                  addOns.map(item => {
                    const qty = selectedAddOns[item.id] || 0;

                    return (
                      <div
                        key={item.id}
                        className="flex justify-between items-center  p-4 pl-10 pr-10 bg-[#F4EAF4] rounded-xl"
                      >
                        <span className="text-xl">{item.name}</span>

                        <div className="flex flex-row items-center gap-x-5 text-xl">
                          <span className="text-right">Rp {formatRupiah(item.price)}</span>

                          {qty > 0 && (
                            <button
                              onClick={() => handleMinus(item.id)}
                              className="w-8 h-8 bg-gray-300 rounded-full"
                            >
                              -
                            </button>
                          )}

                          <span className="w-8 text-center">{qty > 0 ? qty : ""}</span>

                          <button
                            onClick={() => handleAdd(item.id)}
                            className="w-8 h-8 bg-[#0B1957] text-white rounded-full"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex flex-row items-center justify-between mb-30 mt-10">
              <button
                onClick={() => router.push(`/booking/book`)}
                className="flex flex-row items-center gap-x-2 text-xl p-2 border-2 border-[#FA9EBC] rounded-xl pl-6 pr-6"
              >
                <span>
                  <IoArrowBack />
                </span>
                <span>Kembali</span>
              </button>

              <button
                onClick={handleNext}
                className="flex flex-row items-center p-2 bg-[#FA9EBC] text-[#0B1957] pl-6 pr-6 rounded-xl"
                disabled={isHydrated && isLoading}
              >
                <span className="text-xl">Lanjut</span>
                <span className="text-3xl">
                  <IoIosArrowRoundForward />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
