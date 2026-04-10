"use client";
import Footer from "@/utility/footer"
import NavigationBar from "@/utility/navbar";
import { IoIosArrowRoundForward } from "react-icons/io";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Montserrat } from "next/font/google";

const monserratFont = Montserrat({
  subsets: ["latin"],
  weight: "500",
});

export default function Home() {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className={`${monserratFont.className} bg-white text-gray-900`}>
      
        {/* NAVBAR */}
        <div className="fixed top-0 w-full z-50">
            <NavigationBar />
        </div>

        {/* MAIN */}
        <div className="min-h-screen pt-32 px-20">
            <div className="flex flex-col gap-y-16">

                {/* HEADER */}
                <div className="flex justify-center py-4">
                    <span className="text-center text-xl text-[#515151]">
                    Abadikan momen terbaik Anda hari ini. <br />
                    Pesan sesi foto Anda sekarang!
                    </span>
                </div>

                <div className="flex justify-center items-center">
                    <div className="flex flex-row gap-x-3">
                        <div className="border-2 w-7 rounded-2xl text-[#FA9EBC]"/>
                        <div className="border-2 w-7 rounded-2xl text-[#969696]"/>
                        <div className="border-2 w-7 rounded-2xl text-[#969696]"/>
                        <div className="border-2 w-7 rounded-2xl text-[#969696]"/>
                        <div className="border-2 w-7 rounded-2xl text-[#969696]"/>
                        <div className="border-2 w-7 rounded-2xl text-[#969696]"/>
                    </div>
                </div>

                {/* CONTENT */}
                <div className="flex w-full p-10">

                    {/* LEFT - FORM */}
                    <div className="w-1/2">
                    <div className="flex flex-col gap-y-10 max-w-md">

                        <div className="flex flex-col gap-y-2">
                        <label className="text-xl font-semibold text-blue-900">
                            Name
                        </label>
                        <input
                            type="text"
                            placeholder="Enter Name"
                            className="border-b p-2 border-gray-400 w-full focus:outline-none focus:border-blue-500 text-gray-600"
                        />
                        </div>

                        <div className="flex flex-col gap-y-2">
                        <label className="text-xl font-semibold text-blue-900">
                            Email
                        </label>
                        <input
                            type="email"
                            placeholder="Enter Email"
                            className="border-b p-2 border-gray-400 w-full focus:outline-none focus:border-blue-500 text-gray-600"
                        />
                        </div>

                    </div>
                    </div>

                    {/* RIGHT - LOKASI */}
                    <div className="w-1/2">
                    <div className="flex flex-col gap-y-8">

                        <h1 className="text-3xl font-bold">Pilih Lokasi</h1>

                        <div className="flex gap-x-6">
                        {["Jakarta", "Medan", "Surabaya"].map((city) => {
                            const isActive = selectedCity === city;

                            return (
                            <button
                                key={city}
                                onClick={() =>
                                setSelectedCity(
                                    selectedCity === city ? null : city
                                )
                                }
                                className={`px-6 py-2 rounded-xl border-2 transition
                                ${
                                isActive
                                    ? "bg-[#0B1957] text-[#FA9EBC] border-[#0B1957]"
                                    : "bg-[#F8C6D673] text-[#0B1957] border-[#0B1957] hover:bg-[#0B1957] hover:text-[#FA9EBC]"
                                }`}
                            >
                                {city}
                            </button>
                            );
                        })}
                        </div>

                        {/* INDICATOR */}
                        {selectedCity && (
                        <p className="text-sm text-gray-600">
                            Lokasi dipilih:{" "}
                            <span className="font-semibold">{selectedCity}</span>
                        </p>
                        )}

                    </div>
                    </div>

                </div>

                {/* BUTTON */}
                <div className="flex justify-end">
                    <button
                        disabled={!selectedCity}
                        onClick={() => {
                            if (selectedCity) {
                                router.push(`/booking/package?city=${selectedCity}`);
                            }
                        }}
                        className={`flex items-center gap-x-2 px-8 py-2 rounded-lg transition
                        ${
                            selectedCity
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

        {/* FOOTER */}
        <div>
            <div>
                <Footer/>
            </div>
        </div>
    </div>
  );
}