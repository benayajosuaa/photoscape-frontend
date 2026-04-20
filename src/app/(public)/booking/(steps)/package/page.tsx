"use client";

import Footer from "@/utility/footer";
import NavigationBar from "@/utility/navbar";
import { IoArrowBack } from "react-icons/io5";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Montserrat } from "next/font/google";
import { IoIosArrowRoundForward } from "react-icons/io";
import { FiPlus, FiCheck } from "react-icons/fi";
import {
  fetchPublicBookingMeta,
  type PublicBookingAddOn,
  type PublicBookingLocation,
  type PublicBookingPackage,
  type PublicBookingStudio,
} from "@/lib/booking-public";

const monserratFont = Montserrat({
  subsets: ["latin"],
  weight: "500",
});

type PackageType = "studio" | "photobox" | "selfphoto";
type BookingLocation = PublicBookingLocation;
type BookingPackage = PublicBookingPackage;
type BookingAddOn = PublicBookingAddOn;
type BookingStudio = PublicBookingStudio;

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
  const incomingCustomerName = searchParams.get("customerName") || "";
  const incomingCustomerPhone = searchParams.get("customerPhone") || "";

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

  const studiosForLocation = useMemo(
    () =>
      selectedLocationId
        ? studios.filter(studio => studio.locationId === selectedLocationId)
        : studios,
    [studios, selectedLocationId]
  );

  const availableStudioTypes = useMemo(() => {
    const allowedTypes = TAB_TO_STUDIO_TYPE[activeTab];
    const fromBackend = [...new Set(studiosForLocation.map(item => item.type))];
    return allowedTypes.filter(type => fromBackend.includes(type));
  }, [activeTab, studiosForLocation]);

  useEffect(() => {
    const loadMeta = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const meta = await fetchPublicBookingMeta();
        const fetchedLocations = meta.locations ?? [];
        const fetchedStudios = meta.studios ?? [];
        const fetchedPackages = meta.packages ?? [];
        const fetchedAddOns = meta.addOns ?? [];

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
        setErrorMessage(error.message || "Gagal memuat data booking");
      } finally {
        setIsLoading(false);
      }
    };

    void loadMeta();
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
      ...(incomingCustomerName ? { customerName: incomingCustomerName } : {}),
      ...(incomingCustomerPhone ? { customerPhone: incomingCustomerPhone } : {}),
      ...(addOnsQuery ? { addOns: addOnsQuery } : {}),
    });

    router.push(`/booking/schedule?${nextParams.toString()}`);
  };

  return (
    <div className={`${monserratFont.className} bg-white text-gray-900`}>
      <div className="fixed top-0 w-full z-50">
        <NavigationBar />
      </div>

      <div className="min-h-screen px-4 pt-28 sm:px-8 lg:px-20 lg:pt-32">
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
            <h1 className="text-xl text-[#0B1957] font-semibold sm:text-2xl">Pilih Kategori dan Paket</h1>

            {errorMessage && (
              <div className="rounded-xl border border-[#FA9EBC] bg-[#fdebf2] px-5 py-4 text-[#B33362]">
                {errorMessage}
              </div>
            )}

            
            <div className="flex gap-x-4 overflow-x-auto border-b pb-1 text-base sm:gap-x-10 sm:text-xl">
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
                      className="flex w-full flex-col gap-4 rounded-2xl border border-[#0B1957] bg-[#F8C6D673] p-3 text-lg text-[#0B1957] sm:p-4 sm:text-2xl"
                    >
                      <div className="flex w-full flex-row justify-between gap-x-4 p-1 sm:gap-x-10 sm:p-3">
                        <div className="flex w-full flex-col justify-between gap-3 sm:flex-row">
                          <div className="">
                            <h2 className="font-semibold">{item.name}</h2>
                            <p className="mt-1 text-sm text-[#374151] sm:text-base">
                              {item.durationMinutes} menit • Maks {item.maxCapacity} orang
                            </p>
                          </div>

                          <div className="flex flex-row items-center gap-x-2 font-semibold sm:gap-x-3">
                            <span className="text-base font-medium sm:text-xl">Rp</span>
                            <span>{formatRupiah(item.price)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-end">
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
                <h1 className="text-xl font-semibold text-[#0B1957] sm:text-2xl">Tambahan</h1>

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
                        className="flex flex-col items-start justify-between gap-3 rounded-xl bg-[#F4EAF4] p-4 sm:flex-row sm:items-center sm:gap-0 sm:pl-10 sm:pr-10"
                      >
                        <span className="text-base sm:text-xl">{item.name}</span>

                        <div className="flex w-full flex-row items-center justify-between gap-x-3 text-base sm:w-auto sm:gap-x-5 sm:text-xl">
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

            <div className="mb-24 mt-10 flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center lg:mb-30">
              <button
                onClick={() => {
                  const params = new URLSearchParams({
                    ...(selectedLocation ? { city: selectedLocation.name } : {}),
                    ...(selectedLocationId ? { locationId: selectedLocationId } : {}),
                    ...(incomingCustomerName ? { customerName: incomingCustomerName } : {}),
                    ...(incomingCustomerPhone ? { customerPhone: incomingCustomerPhone } : {}),
                  });
                  router.push(`/booking/book${params.toString() ? `?${params.toString()}` : ""}`);
                }}
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
