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

            <div className="flex flex-row pt-30 p-15 justify-between h-screen items-center">
                <div className="flex flex-col gap-y-6">
                    <div className="flex flex-col gap-y-4">
                        <span className="text-5xl text-[#0B1957] mb-5">Hubungi Kami</span>
                        <span className="text-[#515151]">Butuh informasi lebih lanjut? <br/> Jangan ragu untuk menghubungi kami. <br/> Tim kami siap membantu Anda.</span>
                    
                    </div>
                    <div>2</div>
                </div>
                <div className="flex flex-col gap-y-2 justify-start w-150">
                    <div>
                        <div className="text-[#0B1957] text-3xl font-bold mb-15">Sampaikan Pesan Anda</div>
                    </div>
                    {/* isi Form */}
                    <div className="flex flex-col gap-y-6 w-180">
                        <div className="flex flex-col gap-y-3 w-full max-w-md">
                            <label className="text-xl font-semibold text-blue-900">
                                Name
                            </label>

                            <input
                                type="text"
                                placeholder="Enter Name"
                                className="border-b p-2 border-gray-400 w-150 focus:outline-none focus:border-blue-500  text-gray-600"
                            />
                        </div>
                        <div className="flex flex-col gap-y-3 w-full max-w-md">
                            <label className="text-xl font-semibold text-blue-900">
                                Email
                            </label>

                            <input
                                type="text"
                                placeholder="Enter Name"
                                className="border-b p-2 border-gray-400 w-150 focus:outline-none focus:border-blue-500  text-gray-600"
                            />
                        </div>
                        <div className="flex flex-col gap-y-3 w-full max-w-md">
                            <label className="text-xl font-semibold text-blue-900">
                                Message
                            </label>

                            <textarea
                                placeholder="Enter Name"
                                className="border p-2 h-60 border-gray-400 w-150 focus:outline-none focus:border-blue-500 text-gray-600 resize-none"
                            />
                        </div>
                    </div>

                    <div>
                        {/* send message */}
                        <button className="w-full bg-[#FA9EBC] p-3 rounded-2xl mt-15">
                            <span className="font-bold">Kirim</span>
                        </button>
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
