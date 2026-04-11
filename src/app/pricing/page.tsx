"use client"

import NavigationBar from "../../utility/navbar/index"
import Footer from "../../utility/footer"
import { Montserrat } from "next/font/google"
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
      { title: "FAMILY LITE", price: "220.000", pax: "Max 5 orang", duration: "Sesi foto 45 menit", product:"2 Cetak foto 6R", paket:"/pricing/detail/famlite"},
      { title: "FAMILY DELUXE", price: "400.000", pax: "Max 8 orang", duration: "Sesi foto 1 jam", product:"4 Cetak foto 8R", paket:"/pricing/detail/famdeluxe" },
      { title: "FAMILY PREMIUM", price: "630.000", pax: "Max 10 orang", duration: "Sesi foto 1 jam", product:"6 Cetak foto 8R", paket:"/pricing/detail/fampremium" },
    ],
    selfphoto: [
      { title: "GROUP LITE", price: "120.000", pax: "Max 6 orang", duration: "Sesi foto 45 menit", product:"3 foto fisik", paket:"/pricing/detail/group-lite" },
      { title: "GROUP DELUXE", price: "200.000", pax: "Max 10 orang", duration: "Sesi foto 1 jam", product:"5 foto fisik", paket:"/pricing/detail/group-deluxe" },
    ],
    photobox: [
      { title: "PHOTO BOX MOMENTS", price: "40.000", pax: "4 foto", duration: "Sesi foto 10 menit", product:"2 Cetak Foto Strip", paket:"/pricing/detail/photobox" },
    ],
    
  }

  return (
    <div className={`${monserratFont.className} bg-white text-gray-900`}>
      
      {/* NAVBAR */}
      <div className="fixed top-0 w-full z-50">
        <NavigationBar />
      </div>

      {/* CONTENT */}
      <div className="pt-32 p-15 bg-[#FA9EBC59] min-h-screen">

        {/* TITLE */}
        <div className="flex flex-col gap-y-4 mb-10">
          <span className="font-bold text-[#0B1957] text-4xl">
            Daftar Harga Layanan
          </span>
          <span className="text-[#515151] text-lg font-light">
            Pilih paket terbaik untuk momen berharga Anda.
          </span>
        </div>

        {/* TABS */}
        <div className="flex gap-15 border-b mb-10 text-lg">
          <button
            onClick={() => setActiveTab("studio")}
            className={`pb-2 transition-all ${
              activeTab === "studio"
                ? "border-b-2 border-[#FA9EBC] font-semibold text-black"
                : "text-gray-400"
            }`}
          >
            Photo Studio
          </button>
          <button
            onClick={() => setActiveTab("selfphoto")}
            className={`pb-2 transition-all ${
              activeTab === "selfphoto"
                ? "border-b-2 border-[#FA9EBC] font-semibold text-black"
                : "text-gray-400"
            }`}
          >
            Self Photo Studio
          </button>
          <button
            onClick={() => setActiveTab("photobox")}
            className={`pb-2 transition-all ${
              activeTab === "photobox"
                ? "border-b-2 border-[#FA9EBC] font-semibold text-black"
                : "text-gray-400"
            }`}
          >
            Photo Box
          </button>
        </div>

        {/* CARDS */}
        <div className="flex gap-10 h-120 ">
          {packages[activeTab].map((item, index) => (
            <div
                key={index}
                className="bg-white p-6 rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 w-100 flex flex-col gap-y-5"
                >
                <h2 className="text-3xl text-[#0B1957] mb-2 font-extrabold">
                    {item.title}
                </h2>

                <p className="text-2xl font-semibold mb-4 text-[#7d7d7d]"> 
                    Rp <span className="text-4xl text-[#0B1957]">{item.price}</span> 
                </p>

                <div className="text-xl font-thin text-gray-500 mb-6 flex flex-col gap-y-4 mt-8">
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
                  className="mt-auto w-full border-2 border-[#0B1957] text-[#0B1957] py-2 rounded-xl hover:bg-[#0B1957] hover:text-white transition-all text-center"
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
