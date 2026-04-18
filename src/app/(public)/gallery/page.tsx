import NavigationBar from "../../../utility/navbar/index"
import Footer from "../../../utility/footer/index"
import { Montserrat } from "next/font/google"
import Link from "next/link"
import { SlCalender } from "react-icons/sl";

const monserratFont = Montserrat({
  subsets: ["latin"],
  weight: "500",
})

export default function Home() {
  return (
    <div className={`${monserratFont.className} bg-white text-gray-900`}>
      <div>
        <div className="fixed top-0 w-full">
          <NavigationBar />
        </div>
        <div className="px-4 pb-14 pt-24 sm:px-8 sm:pt-28 lg:p-10 lg:pt-24">
          {/* judul */}
          <div className="flex flex-col gap-y-4 sm:gap-y-6">
            <span className="text-3xl font-bold text-[#0B1957] sm:text-4xl">Gallery</span>
            <span className="text-base font-light text-[#515151] sm:text-lg lg:text-xl">
              Jelajahi setiap hasil foto kami, karena setiap frame
              <br className="hidden sm:block" />
              menyimpan cerita yang berharga.
            </span>
          </div>

          <div>
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              <div className="h-[250px] w-auto bg-green-100 sm:h-[320px] lg:h-[600px]">
                <img className="h-full w-full object-cover" src="/gallery/2.jpeg" alt="1" />
              </div>
              <div className="h-[250px] w-auto bg-red-100 sm:h-[320px] lg:col-span-2 lg:h-[600px]">
                <img className="h-full w-full object-cover" src="/fotobaru/2.jpeg" alt="2" />
              </div>
              <div className="h-[250px] bg-amber-100 sm:h-[320px] lg:col-span-2 lg:h-[600px]">
                <img className="h-full w-full object-cover" src="/fotobaru/3.jpeg" alt="3" />
              </div>
              <div className="h-[250px] bg-blue-100 sm:h-[320px] lg:h-[600px]">
                <img className="h-full w-full object-cover" src="/fotobaru/1.jpeg" alt="4" />
              </div>
              <div className="h-[250px] w-auto bg-green-100 sm:h-[320px] lg:h-[600px]">
                <img className="h-full w-full object-cover" src="/gallery/3.jpeg" alt="5" />
              </div>
              <div className="h-[250px] w-auto bg-red-100 sm:h-[320px] lg:col-span-2 lg:h-[600px]">
                <img className="h-full w-full object-cover" src="/gallery/4.jpeg" alt="6" />
              </div>
              <div className="h-[250px] bg-amber-100 sm:h-[320px] lg:col-span-2 lg:h-[600px]">
                <img className="h-full w-full object-cover object-[center_30%]" src="/gallery/1.jpeg" alt="7" />
              </div>
              <div className="h-[250px] bg-blue-100 sm:h-[320px] lg:h-[600px]">
                <img className="h-full w-full object-cover" src="/gallery/5.jpeg" alt="8" />
              </div>
            </div>
          </div>

          {/* ending session */}
          <div className="mb-16 mt-20 flex flex-col items-center justify-center gap-y-8 sm:mt-24 sm:gap-y-10 lg:mb-30 lg:mt-40">
            <div>
              <span className="text-center text-2xl font-extrabold text-[#0B1957] sm:text-3xl">Pesan Sekarang!</span>
            </div>
            <div>
              <span>
                <p className="text-center text-base font-light text-[#515151] sm:text-lg lg:text-xl">
                  Jangan lewatkan kesempatan untuk mengabadikan momen spesial
                  <br className="hidden sm:block" />
                  Anda bersama tim profesional kami.
                </p>
              </span>
            </div>
            <div className="flex w-full max-w-[760px] flex-col gap-4 text-base sm:flex-row sm:justify-center sm:gap-x-6 sm:text-lg lg:gap-x-10 lg:text-xl">
              {/* booking */}
              <div className="rounded-2xl bg-[#FA9EBC] px-6 py-3 sm:px-8 sm:py-4 lg:px-10">
                <div className="flex items-center justify-center gap-x-3">
                  <span className="font-extrabold"><SlCalender /></span>
                  <span><Link href="/booking/book"> Booking Jadwal</Link></span>
                </div>
              </div>
              {/* lihat harga */}
              <div className="rounded-2xl bg-[#FA9EBC59] px-6 py-3 text-center sm:px-8 sm:py-4 lg:px-10">
                <Link href="/pricing"> Lihat daftar Harga</Link>
              </div>
            </div>
          </div>
        </div>
        <div>
          <Footer />
        </div>
      </div>
    </div>
  );
}
