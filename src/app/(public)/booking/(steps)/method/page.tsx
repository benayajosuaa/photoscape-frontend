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
              <div className="w-7 h-2 bg-[#FA9EBC] rounded-full" />
              <div className="w-7 h-2 bg-[#FA9EBC] rounded-full" />
              <div className="w-7 h-2 bg-[#FA9EBC] rounded-full" />
              <div className="w-7 h-2 bg-gray-300 rounded-full" />
            </div>
          </div>

          {/* CONTENT */}
          <div className="">
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}