import NavigationBar from "../../../utility/navbar/index"
import Footer from "../../../utility/footer/index"
import { Montserrat } from "next/font/google"

const monserratFont = Montserrat({
  subsets: ["latin"],
  weight: "500",
})

export default function Home() {
  return (
    <div className={`${monserratFont.className} bg-white text-gray-900`}> 
        <div>
            {/* SECTION 1 */}
            <div className="h-screen bg-green-100 relative">
                 <div className="fixed top-0 z-40 w-full">
                    <NavigationBar />
                </div>
                <div className="absolute z-10  inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent"/>
                <img className="w-screen h-full object-cover" src="/util/sec1.jpg" alt="" />
                
                <div className="absolute z-30 inset-0 flex items-center justify-center">
                    <div className="flex flex-col">
                        <div className="text-white p-30 flex flex-col items-center justify-center gap-y-6">
                            <span className="text-7xl text-center font-bold">Satu Studio, Beragam Cara Mengabadikan Ceritamu</span>
                            <span className="flex text-2xl text-center font-light">Abadikan setiap momen berharga Anda bersama kami—mulai dari foto keluarga profesional, sesi self-photo studio yang privat, hingga pengalaman photo box yang seru dan penuh gaya.</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 2 */}
            <div className=" h-screen w-auto">
                <div className="flex items-center justify-center h-screen">
                    <div className="flex flex-row justify-between p-30 gap-x-20">
                        <div className="w-4/10 flex justify-center items-center">
                            <div className="flex flex-col ">
                                <div>
                                    <span className="text-4xl">Tentang Kami</span>
                                </div>
                                <div className="border-2 w-1/2 text-[#FA9EBC] ml-20 mb-4 mt-3"/>
                                <div className="text-lg flex flex-col gap-y-4">
                                    <span>
                                        Photoscape hadir sejak 2022 dengan visi untuk memberikan pengalaman fotografi yang elegan dan tak terlupakan bagi setiap pelanggan kami. Kami percaya bahwa setiap jepretan adalah potongan cerita hidup yang layak dikenang selamanya.
                                    </span>
                                    <span>
                                        Photoscape hadir sejak 2022 dengan visi untuk memberikan pengalaman fotografi yang elegan dan tak terlupakan bagi setiap pelanggan kami. Kami percaya bahwa setiap jepretan adalah potongan cerita hidup yang layak dikenang selamanya.
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="w-6/10 flex justify-center items-center">
                            <div className="bg-fuchsia-400 h-190 w-200 overflow-hidden">
                                <img className="w-full h-full object-cover" src="/util/photoscape.webp" alt="" />
                            </div>
                            {/* <img className="h-200 object-cover" src="/util/photoscape.webp" alt="" /> */}
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 3 */}
            <div className="h-screen bg-[#F8C6D673]">
                <div className="p-10">
                    <div className="flex justify-center flex-col gap-y-5 text-[#0B1957] mt-15">
                        <span className="text-center font-semibold text-4xl">Layanan Kami</span>
                        <span className="text-center text-xl">Pilih Cara Terbaik Untuk Mengabadikan Momenmu</span>
                    </div>
                    <div className="mt-20">
                        <div className="flex flex-row items-center justify-center gap-x-20">
                            {/* Photostudio */}
                            <div className="bg-fuchsia-400 h-130 w-120 overflow-hidden rounded-3xl relative group">
                                {/* Overlay */}
                                <div className="absolute z-10 bottom-0 w-full bg-white 
                                    h-16 group-hover:h-48 
                                    transition-all duration-500 ease-in-out flex flex-col items-center justify-center">

                                    {/* STATE NORMAL */}
                                    <span className="text-3xl flex items-center justify-center 
                                        group-hover:opacity-0 transition-all duration-300">
                                        Photo Studio
                                    </span>

                                    {/* STATE HOVER */}
                                    <div className="absolute inset-0 flex flex-col justify-center p-10
                                        opacity-0 group-hover:opacity-100 transition-all duration-500 text-center">

                                        <span className="text-3xl font-semibold mb-2 text-center">
                                            Photo Studio
                                        </span>

                                        <span className="text-lg text-center font-thin">
                                            Sesi foto keluarga profesional untuk mengabadikan momen terbaikmu.
                                        </span>
                                    </div>
                                </div>

                                {/* Image */}
                                <img
                                    className="absolute w-full h-full object-cover transition-all duration-500 ease-in-out group-hover:-translate-y-24"
                                    src="/util/photostudio.webp"
                                    alt=""
                                />
                            </div>

                            {/* Photobox */}
                            <div className="bg-fuchsia-400 h-130 w-120 overflow-hidden rounded-3xl relative group">
                                {/* Overlay */}
                                <div className="absolute z-10 bottom-0 w-full bg-white 
                                    h-16 group-hover:h-48 
                                    transition-all duration-500 ease-in-out flex flex-col items-center justify-center">

                                    {/* STATE NORMAL */}
                                    <span className="text-3xl flex items-center justify-center 
                                        group-hover:opacity-0 transition-all duration-300">
                                        Photo box
                                    </span>

                                    {/* STATE HOVER */}
                                    <div className="absolute inset-0 flex flex-col justify-center p-10
                                        opacity-0 group-hover:opacity-100 transition-all duration-500 text-center">

                                        <span className="text-3xl font-semibold mb-2 text-center">
                                            Photo Box
                                        </span>

                                        <span className="text-lg text-center font-thin">
                                            Abadikan momen seru bersama teman atau pasangan dengan pengalaman photo box yang menyenangkan.
                                        </span>
                                    </div>
                                </div>

                                {/* Image */}
                                <img
                                    className="absolute w-full h-full object-cover transition-all duration-500 ease-in-out group-hover:-translate-y-24"
                                    src="/util/pb.webp"
                                    alt=""
                                />
                            </div>

                            {/* Selfphoto */}
                            <div className="bg-fuchsia-400 h-130 w-120 overflow-hidden rounded-3xl relative group">
                                {/* Overlay */}
                                <div className="absolute z-10 bottom-0 w-full bg-white 
                                    h-16 group-hover:h-48 
                                    transition-all duration-500 ease-in-out flex flex-col items-center justify-center">

                                    {/* STATE NORMAL */}
                                    <span className="text-3xl flex items-center justify-center 
                                        group-hover:opacity-0 transition-all duration-300">
                                        Self-Photo Studio
                                    </span>

                                    {/* STATE HOVER */}
                                    <div className="absolute inset-0 flex flex-col justify-center p-10
                                        opacity-0 group-hover:opacity-100 transition-all duration-500 text-center">

                                        <span className="text-3xl font-semibold mb-2 text-center">
                                            Self-Photo Studio
                                        </span>

                                        <span className="text-lg text-center font-thin">
                                            Self-photo studio tanpa fotografer yang memberi kamu kebebasan untuk berpose dan berekspresi sepuasnya.
                                        </span>
                                    </div>
                                </div>

                                {/* Image */}
                                <img
                                    className="absolute w-full h-full object-cover transition-all duration-500 ease-in-out group-hover:-translate-y-24"
                                    src="/util/sp.webp"
                                    alt=""
                                />
                            </div>
                            
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 4 */}
            <div>
                <div className="">
                    <div className="p-10 pb-20 flex flex-col">
                        <div className="flex justify-center mt-10">
                            <span className="font-semibold text-4xl text-center">Lokasi Kami</span>
                        </div>
                        <div className="flex flex-row justify-center gap-x-10 mt-13">
                            {/* Jakarta */}
                            <div className="bg-fuchsia-400 h-130 w-120 overflow-hidden rounded-3xl relative group">
                                <div className="absolute z-20 bottom-0 w-full">
                                    <span className="text-4xl absolute bottom-6 left-8 text-white flex items-center justify-center transition-all duration-300">
                                        Jakarta
                                    </span>
                                </div>
                                <div className="absolute z-10 inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent"/>

                                {/* Image */}
                                <img
                                    className="absolute w-full h-full object-cover transition-all duration-500 ease-in-out group-hover:scale-110"
                                    src="/util/jakarta.jpg"
                                    alt=""
                                />
                            </div>
                            
                            {/* Surabaya */}
                            <div className="bg-fuchsia-400 h-130 w-120 overflow-hidden rounded-3xl relative group">
                                <div className="absolute z-20 bottom-0 w-full">
                                    <span className="text-4xl absolute bottom-6 left-8 text-white flex items-center justify-center transition-all duration-300">
                                        Surabaya
                                    </span>
                                </div>
                                <div className="absolute z-10 inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent"/>

                                {/* Image */}
                                <img
                                    className="absolute w-full h-full object-cover transition-all duration-500 ease-in-out group-hover:scale-110"
                                    src="/util/surabaya.webp"
                                    alt=""
                                />
                            </div>

                            {/* Medan */}
                            <div className="bg-fuchsia-400 h-130 w-120 overflow-hidden rounded-3xl relative group">
                                <div className="absolute z-20 bottom-0 w-full">
                                    <span className="text-4xl absolute bottom-6 left-8 text-white flex items-center justify-center transition-all duration-300">
                                        Medan
                                    </span>
                                </div>
                                <div className="absolute z-10 inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent"/>

                                {/* Image */}
                                <img
                                    className="absolute w-full h-full object-cover transition-all duration-500 ease-in-out group-hover:scale-110"
                                    src="/util/medan.jpg"
                                    alt=""
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 5 */}
            <div>
                <div className="bg-[#D9D9D9] pb-20">
                    <div className="flex flex-col w-full">
                        <div className="flex justify-center items-center">
                            <span className="text-4xl p-10 font-semibold text-[#0B1957]">Foto Terbaru</span>
                        </div>
                        <div className="grid grid-cols-3 pl-20 pr-20 gap-6">
                            <div className="col-span-2 bg-green-100 h-120 w-auto">
                                <img className="w-full h-full object-cover" src="/fotobaru/2.jpeg" alt="" />
                            </div>
                            <div className="bg-red-100 h-120 w-auto">
                                <img className="w-full h-full object-cover" src="/fotobaru/1.jpeg" alt="" />
                            </div>
                            <div className="bg-amber-100 h-120">
                                <img className="w-full h-full object-cover" src="/fotobaru/3.jpeg" alt="" />
                            </div>
                            <div className="col-span-2 bg-blue-100 h-120">
                                <img className="w-full h-full object-cover" src="/fotobaru/4.png" alt="" />
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
