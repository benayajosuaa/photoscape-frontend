import NavigationBar from "../../../utility/navbar/index"
import Footer from "../../../utility/footer/index"
import { Montserrat } from "@/lib/font-fallback"

const monserratFont = Montserrat({
  subsets: ["latin"],
  weight: "500",
})

export default function Home() {
  return (
    <div className={`${monserratFont.className} bg-white text-gray-900`}>
      <div>
        {/* SECTION 1 */}
        <div className="relative h-[100svh] min-h-[680px] overflow-hidden bg-green-100 sm:min-h-screen">
          <div className="fixed top-0 z-40 w-full">
            <NavigationBar />
          </div>
          <img className="absolute inset-0 h-full w-full object-cover object-center" src="/util/sec1.jpg" alt="" />
          <div className="absolute inset-0 z-10 bg-linear-to-t from-black/70 via-black/10 to-transparent" />

          <div className="absolute inset-0 z-30 flex items-center justify-center px-4 pt-24 sm:px-8 lg:px-20">
            <div className="flex w-full max-w-[1220px] flex-col items-center justify-center gap-y-4 text-white sm:gap-y-6">
              <span className="text-center text-3xl font-bold sm:text-5xl lg:text-7xl">
                Satu Studio, Beragam Cara Mengabadikan Ceritamu
              </span>
              <span className="text-center text-base font-light sm:text-lg lg:text-2xl">
                Abadikan setiap momen berharga Anda bersama kami-mulai dari foto keluarga profesional, sesi self-photo studio
                yang privat, hingga pengalaman photo box yang seru dan penuh gaya.
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 2 */}
        <div className="w-auto py-14 sm:py-16 lg:min-h-screen lg:py-0">
          <div className="flex items-center justify-center lg:min-h-screen">
            <div className="mx-auto flex w-full max-w-[1450px] flex-col-reverse items-center gap-10 px-4 sm:px-8 lg:flex-row lg:justify-between lg:gap-x-20 lg:px-16">
              <div className="w-full lg:w-4/10">
                <div className="flex flex-col">
                  <div>
                    <span className="text-3xl sm:text-4xl">Tentang Kami</span>
                  </div>
                  <div className="ml-14 mb-4 mt-3 w-1/2 border-2 text-[#FA9EBC] sm:ml-20" />
                  <div className="flex flex-col gap-y-4 text-base sm:text-lg">
                    <span>
                      Photoscape hadir sejak 2022 dengan visi untuk memberikan pengalaman fotografi yang elegan dan tak
                      terlupakan bagi setiap pelanggan kami. Kami percaya bahwa setiap jepretan adalah potongan cerita hidup yang
                      layak dikenang selamanya.
                    </span>
                    <span>
                      Photoscape hadir sejak 2022 dengan visi untuk memberikan pengalaman fotografi yang elegan dan tak
                      terlupakan bagi setiap pelanggan kami. Kami percaya bahwa setiap jepretan adalah potongan cerita hidup yang
                      layak dikenang selamanya.
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex w-full justify-center lg:w-6/10">
                <div className="h-[280px] w-full max-w-[860px] overflow-hidden bg-fuchsia-400 sm:h-[420px] lg:h-[760px]">
                  <img className="h-full w-full object-cover" src="/util/photoscape.webp" alt="" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3 */}
        <div className="bg-[#F8C6D673] px-4 py-14 sm:px-8 lg:min-h-screen lg:px-10 lg:py-10">
          <div className="flex flex-col justify-center gap-y-4 pt-2 text-[#0B1957] sm:gap-y-5 lg:mt-12">
            <span className="text-center text-3xl font-semibold sm:text-4xl">Layanan Kami</span>
            <span className="text-center text-base sm:text-lg lg:text-xl">Pilih Cara Terbaik Untuk Mengabadikan Momenmu</span>
          </div>
          <div className="mx-auto mt-10 grid max-w-[1320px] grid-cols-1 gap-6 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3 lg:gap-x-10">
            {/* Photostudio */}
            <div className="group relative h-[360px] w-full overflow-hidden rounded-3xl bg-fuchsia-400 sm:h-[430px] lg:h-[520px]">
              {/* Overlay */}
              <div className="absolute bottom-0 z-10 flex h-14 w-full flex-col items-center justify-center bg-white transition-all duration-500 ease-in-out group-hover:h-40 sm:h-16 sm:group-hover:h-44 lg:group-hover:h-48">
                {/* STATE NORMAL */}
                <span className="flex items-center justify-center text-2xl transition-all duration-300 group-hover:opacity-0 sm:text-3xl">
                  Photo Studio
                </span>

                {/* STATE HOVER */}
                <div className="absolute inset-0 flex flex-col justify-center p-6 text-center opacity-0 transition-all duration-500 group-hover:opacity-100 sm:p-10">
                  <span className="mb-2 text-center text-2xl font-semibold sm:text-3xl">Photo Studio</span>

                  <span className="text-center text-sm font-thin sm:text-base lg:text-lg">
                    Sesi foto keluarga profesional untuk mengabadikan momen terbaikmu.
                  </span>
                </div>
              </div>

              {/* Image */}
              <img
                className="absolute h-full w-full object-cover transition-all duration-500 ease-in-out group-hover:-translate-y-16 lg:group-hover:-translate-y-24"
                src="/util/photostudio.webp"
                alt=""
              />
            </div>

            {/* Photobox */}
            <div className="group relative h-[360px] w-full overflow-hidden rounded-3xl bg-fuchsia-400 sm:h-[430px] lg:h-[520px]">
              {/* Overlay */}
              <div className="absolute bottom-0 z-10 flex h-14 w-full flex-col items-center justify-center bg-white transition-all duration-500 ease-in-out group-hover:h-40 sm:h-16 sm:group-hover:h-44 lg:group-hover:h-48">
                {/* STATE NORMAL */}
                <span className="flex items-center justify-center text-2xl transition-all duration-300 group-hover:opacity-0 sm:text-3xl">
                  Photo box
                </span>

                {/* STATE HOVER */}
                <div className="absolute inset-0 flex flex-col justify-center p-6 text-center opacity-0 transition-all duration-500 group-hover:opacity-100 sm:p-10">
                  <span className="mb-2 text-center text-2xl font-semibold sm:text-3xl">Photo Box</span>

                  <span className="text-center text-sm font-thin sm:text-base lg:text-lg">
                    Abadikan momen seru bersama teman atau pasangan dengan pengalaman photo box yang menyenangkan.
                  </span>
                </div>
              </div>

              {/* Image */}
              <img
                className="absolute h-full w-full object-cover transition-all duration-500 ease-in-out group-hover:-translate-y-16 lg:group-hover:-translate-y-24"
                src="/util/pb.webp"
                alt=""
              />
            </div>

            {/* Selfphoto */}
            <div className="group relative h-[360px] w-full overflow-hidden rounded-3xl bg-fuchsia-400 sm:h-[430px] lg:h-[520px]">
              {/* Overlay */}
              <div className="absolute bottom-0 z-10 flex h-14 w-full flex-col items-center justify-center bg-white transition-all duration-500 ease-in-out group-hover:h-40 sm:h-16 sm:group-hover:h-44 lg:group-hover:h-48">
                {/* STATE NORMAL */}
                <span className="flex items-center justify-center text-xl transition-all duration-300 group-hover:opacity-0 sm:text-3xl">
                  Self-Photo Studio
                </span>

                {/* STATE HOVER */}
                <div className="absolute inset-0 flex flex-col justify-center p-6 text-center opacity-0 transition-all duration-500 group-hover:opacity-100 sm:p-10">
                  <span className="mb-2 text-center text-2xl font-semibold sm:text-3xl">Self-Photo Studio</span>

                  <span className="text-center text-sm font-thin sm:text-base lg:text-lg">
                    Self-photo studio tanpa fotografer yang memberi kamu kebebasan untuk berpose dan berekspresi sepuasnya.
                  </span>
                </div>
              </div>

              {/* Image */}
              <img
                className="absolute h-full w-full object-cover transition-all duration-500 ease-in-out group-hover:-translate-y-16 lg:group-hover:-translate-y-24"
                src="/util/sp.webp"
                alt=""
              />
            </div>
          </div>
        </div>

        {/* SECTION 4 */}
        <div className="px-4 pb-14 pt-14 sm:px-8 lg:p-10 lg:pb-20">
          <div className="flex justify-center">
            <span className="text-center text-3xl font-semibold sm:text-4xl">Lokasi Kami</span>
          </div>
          <div className="mx-auto mt-10 grid max-w-[1320px] grid-cols-1 gap-6 sm:grid-cols-2 lg:mt-13 lg:grid-cols-3 lg:gap-x-10">
            {/* Jakarta */}
            <div className="group relative h-[360px] w-full overflow-hidden rounded-3xl bg-fuchsia-400 sm:h-[430px] lg:h-[520px]">
              <div className="absolute bottom-0 z-20 w-full">
                <span className="absolute bottom-5 left-6 flex items-center justify-center text-3xl text-white transition-all duration-300 sm:bottom-6 sm:left-8 sm:text-4xl">
                  Jakarta
                </span>
              </div>
              <div className="absolute inset-0 z-10 bg-linear-to-t from-black/70 via-black/10 to-transparent" />

              {/* Image */}
              <img
                className="absolute h-full w-full object-cover transition-all duration-500 ease-in-out group-hover:scale-110"
                src="/util/jakarta.jpg"
                alt=""
              />
            </div>

            {/* Surabaya */}
            <div className="group relative h-[360px] w-full overflow-hidden rounded-3xl bg-fuchsia-400 sm:h-[430px] lg:h-[520px]">
              <div className="absolute bottom-0 z-20 w-full">
                <span className="absolute bottom-5 left-6 flex items-center justify-center text-3xl text-white transition-all duration-300 sm:bottom-6 sm:left-8 sm:text-4xl">
                  Surabaya
                </span>
              </div>
              <div className="absolute inset-0 z-10 bg-linear-to-t from-black/70 via-black/10 to-transparent" />

              {/* Image */}
              <img
                className="absolute h-full w-full object-cover transition-all duration-500 ease-in-out group-hover:scale-110"
                src="/util/surabaya.webp"
                alt=""
              />
            </div>

            {/* Medan */}
            <div className="group relative h-[360px] w-full overflow-hidden rounded-3xl bg-fuchsia-400 sm:h-[430px] lg:h-[520px]">
              <div className="absolute bottom-0 z-20 w-full">
                <span className="absolute bottom-5 left-6 flex items-center justify-center text-3xl text-white transition-all duration-300 sm:bottom-6 sm:left-8 sm:text-4xl">
                  Medan
                </span>
              </div>
              <div className="absolute inset-0 z-10 bg-linear-to-t from-black/70 via-black/10 to-transparent" />

              {/* Image */}
              <img
                className="absolute h-full w-full object-cover transition-all duration-500 ease-in-out group-hover:scale-110"
                src="/util/medan.jpg"
                alt=""
              />
            </div>
          </div>
        </div>

        {/* SECTION 5 */}
        <div>
          <div className="bg-[#D9D9D9] px-4 pb-14 pt-10 sm:px-8 sm:pb-16 lg:px-20 lg:pb-20">
            <div className="flex w-full flex-col">
              <div className="flex items-center justify-center">
                <span className="p-6 text-3xl font-semibold text-[#0B1957] sm:p-8 sm:text-4xl lg:p-10">Foto Terbaru</span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                <div className="h-[260px] w-auto bg-green-100 sm:h-[320px] lg:col-span-2 lg:h-[480px]">
                  <img className="h-full w-full object-cover" src="/fotobaru/2.jpeg" alt="" />
                </div>
                <div className="h-[260px] w-auto bg-red-100 sm:h-[320px] lg:h-[480px]">
                  <img className="h-full w-full object-cover" src="/fotobaru/1.jpeg" alt="" />
                </div>
                <div className="h-[260px] bg-amber-100 sm:h-[320px] lg:h-[480px]">
                  <img className="h-full w-full object-cover" src="/fotobaru/3.jpeg" alt="" />
                </div>
                <div className="h-[260px] bg-blue-100 sm:h-[320px] lg:col-span-2 lg:h-[480px]">
                  <img className="h-full w-full object-cover" src="/fotobaru/4.png" alt="" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div>
          <div>
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}
