"use client"

import NavigationBar from "../../utility/navbar/index"
import Footer from "../../utility/footer"
import { Montserrat } from "@/lib/font-fallback"
import { useState } from "react"
import { RiGroup3Fill } from "react-icons/ri";
import { RiTimerLine } from "react-icons/ri";
import { HiOutlinePhoto } from "react-icons/hi2";
import Link from "next/link"

type PackageItem = {
  title: string
  price: string
  pax: string
  duration: string
  product: string
  paket: string
}

type PackageCategory = "studio" | "photobox" | "selfphoto"

const monserratFont = Montserrat({
  subsets: ["latin"],
  weight: "600",
})

export default function Home() {
  const [activeTab, setActiveTab] = useState<PackageCategory>("studio")

  const packages: Record<PackageCategory, PackageItem[]> = {
    studio: [
      { title: "FAMILY LITE", price: "220.000", pax: "Max 5 orang", duration: "Sesi foto 50 menit", product: "2 Cetak foto 6R", paket: "/pricing/detail/famlite" },
      { title: "FAMILY DELUXE", price: "400.000", pax: "Max 8 orang", duration: "Sesi foto 50 menit", product: "4 Cetak foto 8R", paket: "/pricing/detail/famdeluxe" },
      { title: "FAMILY PREMIUM", price: "630.000", pax: "Max 10 orang", duration: "Sesi foto 50 menit", product: "6 Cetak foto 8R", paket: "/pricing/detail/fampremium" },
    ],
    selfphoto: [
      { title: "GROUP LITE", price: "120.000", pax: "Max 6 orang", duration: "Sesi foto 50 menit", product: "3 foto fisik", paket: "/pricing/detail/group-lite" },
      { title: "GROUP DELUXE", price: "200.000", pax: "Max 10 orang", duration: "Sesi foto 50 menit", product: "5 foto fisik", paket: "/pricing/detail/group-deluxe" },
    ],
    photobox: [
      { title: "PHOTO BOX MOMENTS", price: "40.000", pax: "4 foto", duration: "Sesi foto 25 menit", product: "2 Cetak Foto Strip", paket: "/pricing/detail/photobox" },
    ],
  }

  return (
    <div className={`${monserratFont.className} bg-white text-gray-900`}>

      {/* NAVBAR */}
      <div className="fixed top-0 z-50 w-full">
        <NavigationBar />
      </div>

      {/* CONTENT */}
      <div className="min-h-screen bg-[#FA9EBC59] px-4 pb-14 pt-24 sm:px-8 sm:pt-28 lg:px-12 lg:pb-14 lg:pt-32">

        {/* TITLE */}
        <div className="mb-8 flex flex-col gap-y-3 sm:mb-10 sm:gap-y-4">
          <span className="text-3xl font-bold text-[#0B1957] sm:text-4xl">
            Daftar Harga Layanan
          </span>
          <span className="text-base font-light text-[#515151] sm:text-lg">
            Pilih paket terbaik untuk momen berharga Anda.
          </span>
        </div>

        {/* TABS */}
        <div className="mb-8 flex gap-6 overflow-x-auto border-b pb-1 text-base sm:mb-10 sm:gap-10 sm:text-lg lg:gap-15">
          <button
            onClick={() => setActiveTab("studio")}
            className={`shrink-0 pb-2 transition-all ${
              activeTab === "studio"
                ? "border-b-2 border-[#FA9EBC] font-semibold text-black"
                : "text-gray-400"
            }`}
          >
            Photo Studio
          </button>
          <button
            onClick={() => setActiveTab("selfphoto")}
            className={`shrink-0 pb-2 transition-all ${
              activeTab === "selfphoto"
                ? "border-b-2 border-[#FA9EBC] font-semibold text-black"
                : "text-gray-400"
            }`}
          >
            Self Photo Studio
          </button>
          <button
            onClick={() => setActiveTab("photobox")}
            className={`shrink-0 pb-2 transition-all ${
              activeTab === "photobox"
                ? "border-b-2 border-[#FA9EBC] font-semibold text-black"
                : "text-gray-400"
            }`}
          >
            Photo Box
          </button>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:flex lg:gap-10 lg:h-[480px]">
          {packages[activeTab].map((item, index) => (
            <div
              key={index}
              className="flex w-full flex-col gap-y-5 rounded-3xl bg-white p-5 shadow-md transition-all duration-300 hover:shadow-2xl sm:p-6 lg:w-[400px]"
            >
              <h2 className="mb-2 text-2xl font-extrabold text-[#0B1957] sm:text-3xl">
                {item.title}
              </h2>

              <p className="mb-3 text-xl font-semibold text-[#7d7d7d] sm:mb-4 sm:text-2xl">
                Rp <span className="text-3xl text-[#0B1957] sm:text-4xl">{item.price}</span>
              </p>

              <div className="mt-2 mb-4 flex flex-col gap-y-3 text-base font-thin text-gray-500 sm:mb-6 sm:mt-4 sm:gap-y-4 sm:text-xl sm:font-normal">
                <div className="flex flex-row items-center gap-x-3">
                  <span><RiGroup3Fill /></span>
                  <span>{item.pax}</span>
                </div>

                <div className="flex flex-row items-center gap-x-3">
                  <span><RiTimerLine /></span>
                  <span>{item.duration}</span>
                </div>

                <div className="flex flex-row items-center gap-x-3">
                  <span><HiOutlinePhoto /></span>
                  <span>{item.product}</span>
                </div>
              </div>

              <Link
                href={item.paket}
                className="mt-auto w-full rounded-xl border-2 border-[#0B1957] py-2 text-center text-[#0B1957] transition-all hover:bg-[#0B1957] hover:text-white"
              >
                Detail Paket
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
