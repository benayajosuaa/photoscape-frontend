"use client";

import Footer from "@/utility/footer";
import NavigationBar from "@/utility/navbar";
import { IoArrowBack } from "react-icons/io5";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Montserrat } from "next/font/google";
import { IoIosArrowRoundForward } from "react-icons/io";

import { FiPlus } from "react-icons/fi";
import { FiCheck } from "react-icons/fi";

const monserratFont = Montserrat({
  subsets: ["latin"],
  weight: "500",
});

type PackageType = "studio" | "photobox" | "selfphoto";

type PackageItem = {
  title: string;
  price: number;
  type: PackageType;
};



type PackageMap = Record<PackageType, PackageItem[]>;

export default function Home() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<PackageType>("studio")
  const [selectedPackage, setSelectedPackage] = useState<PackageItem | null>(null)
  const [selectExtra, setExtra] = useState<Record<string, number>>({})

  const handleAdd = (jenis: string) => {
    setExtra((prev) => ({
      ...prev,
      [jenis]: (prev[jenis] || 0) + 1,
    }));
  };

  const handleMinus = (jenis: string) => {
    setExtra((prev) => ({
      ...prev,
      [jenis]: Math.max((prev[jenis] || 0) - 1, 0),
    }));
  };


  const PaketTambahan = [
    {jenis:"Tambahan Orang", price:50000},
    {jenis:"Cetak Foto 8R", price:50000},
  ]

  const packages: PackageMap = {
    studio: [
      { title: "Family Lite", price: 220000, type: "studio" },
      { title: "Family Deluxe", price: 400000, type: "studio" },
      { title: "Family Premium", price: 630000, type: "studio" },
    ],
    selfphoto: [
      { title: "Group Lite", price: 120000, type: "selfphoto" },
      { title: "Group Deluxe", price: 200000, type: "selfphoto" },
    ],
    photobox: [
      { title: "Photo Box", price: 40000, type: "photobox" },
    ],
  };

  return (
    <div className={`${monserratFont.className} bg-white text-gray-900`}>

      {/* NAVBAR */}
      <div className="fixed top-0 w-full z-50">
        <NavigationBar />
      </div>

      {/* MAIN */}
      <div className="min-h-screen pt-32 px-20">
        <div className="flex flex-col gap-y-16">

          {/* HEADER STEP */}
          <div className="flex justify-center">
            <div className="flex gap-x-3">
              <div className="w-7 h-2 bg-[#FA9EBC] rounded-full" />
              <div className="w-7 h-2 bg-[#FA9EBC] rounded-full" />
              <div className="w-7 h-2 bg-gray-300 rounded-full" />
              <div className="w-7 h-2 bg-gray-300 rounded-full" />
              <div className="w-7 h-2 bg-gray-300 rounded-full" />
            </div>
          </div>

          {/* CONTENT */}
          <div className="flex flex-col gap-y-12">

            {/* TITLE */}
            <h1 className="text-2xl text-[#0B1957] font-semibold">
              Pilih Kategori dan Paket
            </h1>

            {/* TAB */}
            <div className="flex gap-x-10 border-b text-xl">
              <button
                onClick={() => {
                  setActiveTab("studio");
                  setSelectedPackage(null);
                }}
                className={`${
                  activeTab === "studio"
                    ? "border-b-3 border-[#FA9EBC] font-semibold text-[#0B1957]"
                    : "text-gray-400"
                }`}
              >
                Photo Studio
              </button>

              <button
                onClick={() => {
                  setActiveTab("selfphoto");
                  setSelectedPackage(null);
                }}
                className={`${
                  activeTab === "selfphoto"
                    ? "border-b-3 border-[#FA9EBC] font-semibold text-[#0B1957]"
                    : "text-gray-400"
                }`}
              >
                Self Photo
              </button>

              <button
                onClick={() => {
                  setActiveTab("photobox");
                  setSelectedPackage(null);
                }}
                className={`${
                  activeTab === "photobox"
                    ? "border-b-3 border-[#FA9EBC] font-semibold text-[#0B1957]"
                    : "text-gray-400"
                }`}
              >
                Photobox
              </button>
            </div>

            {/* Packages */}
            <div>
              <div className="flex flex-col gap-8 h-100">
                {
                  packages[activeTab].map((item, index) => {
                  const isSelected = selectedPackage?.title === item.title;

                  return (
                    <div
                      key={index}
                      className="text-2xl p-4 border border-[#0B1957] bg-[#F8C6D673] text-[#0B1957] rounded-2xl"
                    >
                      <div className="flex flex-row justify-between gap-x-10 p-3">
                        
                        <div className="flex flex-row justify-between w-full">
                          <h2 className="font-semibold">{item.title}</h2>

                          <div className="flex flex-row gap-x-3 items-end font-semibold">
                            <span className="text-xl font-medium">Rp</span>
                            <span>{new Intl.NumberFormat("id-ID").format(item.price)}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (isSelected) {
                              setSelectedPackage(null);
                            } else {
                              setSelectedPackage(item);
                            }
                          }}
                          className={`w-10 h-10 rounded-full flex items-center font-bold justify-center transition-all
                            ${isSelected 
                              ? "bg-white text-[#0B1957] font-bold" 
                              : "bg-[#0B1957] text-white hover:scale-110 font-bold"}
                          `}
                        >
                          {isSelected ? <FiCheck size={20} /> : <FiPlus size={20} />}
                        </button>
                      </div>
                    </div>
                  );
                })
                }
              </div>
            </div>
          
            {/* Tambahan */}
            <div>
                <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-semibold text-[#0B1957]">Tambahan</h1>

                {PaketTambahan.map((item, index) => {
                  const qty = selectExtra[item.jenis] || 0;

                  return (
                    <div
                      key={index}
                      className="flex justify-between items-center p-4 pl-10 pr-10 bg-[#F4EAF4] rounded-xl"
                    >
                      <span className="text-xl">{item.jenis}</span>

                      <div className="flex flex-row items-center gap-x-5 text-xl">
                        <span className="text-right">
                          Rp {new Intl.NumberFormat("id-ID").format(item.price)}
                        </span>

                        {qty > 0 && (
                          <button
                            onClick={() => handleMinus(item.jenis)}
                            className="w-8 h-8 bg-gray-300 rounded-full"
                          >
                            -
                          </button>
                        )}

                        <span className="w-8 text-center">
                          {qty > 0 ? qty : ""}
                        </span>

                        <button
                          onClick={() => handleAdd(item.jenis)}
                          className="w-8 h-8 bg-[#0B1957] text-white rounded-full"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Button */}
            <div>
              <div className="flex flex-row items-center justify-between mb-30 mt-10">
                <div>
                  {/* button back */}
                  <button 
                    onClick={()=> (
                      router.push(`/booking/book`)
                    )}
                    className="flex flex-row items-center gap-x-2 text-xl p-2 border-2 border-[#FA9EBC] rounded-xl pl-6 pr-6">
                    <span><IoArrowBack /></span>
                    <span>Kembali</span>
                  </button>
                </div>
                {/* button next */}
                <div>
                  <button 
                    onClick={() => {
                      if(!selectedPackage){
                        alert("Pilih paket dulu !")
                        return
                      }
                      router.push("/booking/schedule")
                    }}
                    className="flex flex-row items-center p-2 bg-[#FA9EBC] text-[#0B1957] pl-6 pr-6 rounded-xl">
                    <span className="text-xl">Lanjut</span>
                    <span className="text-3xl"><IoIosArrowRoundForward /></span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}