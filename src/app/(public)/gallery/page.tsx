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
    <div className={`${monserratFont.className}`}> 
       <div>
            <div className="fixed top-0 w-full">
                <NavigationBar />
            </div>
            <div className="p-10">
                {/* judul */}
                <div className="flex flex-col gap-y-6 pt-24">
                    <span className="font-bold font-[#0B1957] text-4xl">Gallery</span>
                    <span className="font-[#515151] text-xl font-light">Jelajahi setiap hasil foto kami, karena setiap frame <br/> menyimpan cerita yang berharga.</span>
                </div>


                <div>
                    <div className="grid grid-cols-3 mt-15">
                        <div className="bg-green-100 h-150 w-auto">
                            <img className="w-full h-full object-cover" src="/gallery/2.jpeg" alt="1" />
                        </div>
                        <div className="bg-red-100 col-span-2 h-150 w-auto">
                            <img className="w-full h-full object-cover" src="/fotobaru/2.jpeg" alt="2" />
                        </div>
                        <div className="bg-amber-100 col-span-2 h-150">
                            <img className="w-full h-full object-cover" src="/fotobaru/3.jpeg" alt="3" />
                        </div>
                        <div className=" bg-blue-100 h-150">
                            <img className="w-full h-full object-cover" src="/fotobaru/1.jpeg" alt="4" />
                        </div>
                        <div className=" bg-green-100 h-150 w-auto">
                            <img className="w-full h-full object-cover" src="/gallery/3.jpeg" alt="5" />
                        </div>
                        <div className="bg-red-100 col-span-2 h-150 w-auto">
                            <img className="w-full h-full object-cover" src="/gallery/4.jpeg" alt="6" />
                        </div>
                        <div className="bg-amber-100 col-span-2 h-150">
                            <img className="w-full h-full object-cover object-[center_30%]" src="/gallery/1.jpeg" alt="7" />
                        </div>
                        <div className=" bg-blue-100 h-150">
                            <img className="w-full h-full object-cover" src="/gallery/5.jpeg" alt="8" />
                        </div>
                    </div>
                </div>            




                {/* ending session */}
                <div className="flex flex-col mt-50 mb-30 justify-center items-center gap-y-10">
                    <div>
                        <span className="font-[#0B1957] text-3xl font-extrabold">Pesan Sekarang!</span>
                    </div>
                    <div>
                        <span>
                            <p className="font-[#515151] text-xl text-center font-light">Jangan lewatkan kesempatan untuk mengabadikan momen spesial <br/> Anda bersama tim profesional kami.</p>
                        </span>
                    </div>
                    <div className="flex flex-row gap-x-10 text-xl">
                        {/* booking */}
                        <div className="bg-[#FA9EBC] pt-4 pb-4 pr-10 pl-10 rounded-2xl">
                            <div className="flex items-center justify-center gap-x-3">
                                <span className="font-extrabold"><SlCalender /></span>
                                <span><Link href=""> Booking Jadwal</Link></span>
                            </div>
                        </div>
                        {/* lihat harga */}
                        <div className="bg-[#FA9EBC59] pt-4 pb-4 pr-10 pl-10 rounded-2xl">
                            <Link href=""> Lihat daftar Harga</Link>
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
