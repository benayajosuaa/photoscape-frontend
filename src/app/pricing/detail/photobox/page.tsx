"use client"
import { Montserrat } from "next/font/google"
import Navbar from "../../../../utility/navbar/index"
import Footer from "../../../../utility/footer/index"
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { LuTag } from "react-icons/lu";
import Link from "next/link";

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
  weight: "500",
})

export default function Home() {
  
  return (
    <div className={`${monserratFont.className} bg-white text-gray-900`}>
      
        {/* NAVBAR */}
        <div className="fixed top-0 w-full z-50">
            <Navbar />
        </div>

        <div className="pt-30 p-20">
            <div>
              <div className="text-xl">
                <div className="flex flex-row items-center gap-3 mb-10">
                  <Link href="/pricing" className="flex flex-row items-center gap-x-3 font-semibold text-gray-500">
                    <span> <MdOutlineKeyboardBackspace /> </span>
                    <span>Kembali</span>
                  </Link>
                </div>
              </div>

              <div className="flex flex-row justify-between gap-x-10">
                <div>
                  <div className="h-130 w-180 bg-amber-100">
                    {/* <img src="" alt="" /> */}
                    1
                  </div>
                </div>
                <div className="w-150 text-left">
                  <div className="flex flex-col gap-y-20">
                    <div>
                      <div className="flex flex-col gap-y-6">
                        <span className="text-[#0B1957] text-4xl">
                          <h1 className="font-bold mb-8">Photo Box Moments</h1>
                        </span>
                        <span>
                          <p className="text-xl font-thin">
                            Paket foto cepat dan seru yang cocok untuk anak muda atau teman-teman yang ingin mengabadikan momen singkat dengan gaya santai
                          </p>
                        </span>
                        <span className="flex flex-row gap-x-4 text-[#0B1957]">
                          <span className="flex items-end font-bold text-xl text-[#515151]">Rp </span>
                          <span className="text-4xl">40.000</span>
                        </span>
                      </div>
                    </div>
                    <div className="text-[#515151]">
                      <span className="text-2xl">Apa yang didapatkan :</span>
                      <span className="flex flex-col relative left-6 text-lg mt-3">
                        <li>Menggunakan ruang Photo Box</li>
                        <li>Menggunakan ruang Photo Box</li>
                        <li>Softcopy foto via QR / email</li>
                        <li>⁠Aksesoris foto tersedia</li>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>
        
        <div>
          <Footer/>
        </div>
    </div>
  );
}
