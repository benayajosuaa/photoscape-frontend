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
        <div className="fixed top-0 w-full">
          <NavigationBar />
        </div>

        <div className="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col gap-12 px-4 pb-14 pt-24 sm:px-8 sm:pt-28 lg:flex-row lg:justify-between lg:gap-10 lg:px-16 lg:pb-10 lg:pt-30 lg:items-center">
          <div className="flex w-full flex-col gap-y-6 lg:w-[45%]">
            <div className="flex flex-col gap-y-4">
              <span className="mb-3 text-3xl text-[#0B1957] sm:mb-5 sm:text-4xl lg:text-5xl">Hubungi Kami</span>
              <span className="text-sm text-[#515151] sm:text-base">
                Butuh informasi lebih lanjut?
                <br />
                Jangan ragu untuk menghubungi kami.
                <br />
                Tim kami siap membantu Anda.
              </span>
            </div>
          </div>
          <div className="flex w-full flex-col gap-y-3 lg:w-[55%] lg:max-w-[760px]">
            <div className="text-2xl font-bold text-[#0B1957] sm:text-3xl lg:mb-8 lg:text-4xl">Sampaikan Pesan Anda</div>

            {/* isi Form */}
            <div className="flex w-full flex-col gap-y-5 sm:gap-y-6">
              <div className="flex w-full flex-col gap-y-2 sm:gap-y-3">
                <label className="text-lg font-semibold text-blue-900 sm:text-xl">
                  Name
                </label>

                <input
                  type="text"
                  placeholder="Enter Name"
                  className="w-full border-b border-gray-400 p-2 text-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex w-full flex-col gap-y-2 sm:gap-y-3">
                <label className="text-lg font-semibold text-blue-900 sm:text-xl">
                  Email
                </label>

                <input
                  type="text"
                  placeholder="Enter Name"
                  className="w-full border-b border-gray-400 p-2 text-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex w-full flex-col gap-y-2 sm:gap-y-3">
                <label className="text-lg font-semibold text-blue-900 sm:text-xl">
                  Message
                </label>

                <textarea
                  placeholder="Enter Name"
                  className="h-44 w-full resize-none border border-gray-400 p-2 text-gray-600 focus:border-blue-500 focus:outline-none sm:h-52 lg:h-60"
                />
              </div>
            </div>

            <div>
              {/* send message */}
              <button className="mt-8 w-full rounded-2xl bg-[#FA9EBC] p-3 sm:mt-10 lg:mt-12">
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
