"use client"
import Link from "next/link"
import { Montserrat } from "@/lib/font-fallback"

const monserratFont = Montserrat({
  subsets: ["latin"],
  weight: "400",
})

export default function NavigationBar() {

  return (
    <div className={`${monserratFont.className}`}>
        <div className="bg-[#0B1957] px-4 py-6 text-[#FA9EBC] sm:px-8 lg:px-10">
            <div className="mx-auto w-full max-w-[1200px]">
                <div className="flex flex-col gap-8 sm:gap-10 lg:flex-row lg:justify-between">
                    <div className="flex flex-col">
                        <div className="mb-4">
                            <img className="h-8 w-auto sm:h-9 lg:h-10" src="/logo/logo1.png" alt="" />
                        </div>
                        <div>
                            <span className="text-sm sm:text-base">
                                <p>Kami mendedikasikan setiap jepretan untuk <br/> menceritakan kisah unik Anda dengan kualitas <br/> terbaik sejak 2022.</p>
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-y-1 text-sm sm:text-base">
                        <span className="mb-2 text-lg font-bold sm:text-xl lg:mb-3">Menu</span>
                        <span><Link href="/">Home</Link></span>
                        <span><Link href="/pricing">Pricing</Link></span>
                        <span><Link href="/gallery">Gallery</Link></span>
                        <span><Link href="/booking/book">Booking</Link></span>
                        <span><Link href="/contact-us">Contact Us</Link></span>
                    </div>
                    <div className="flex flex-col gap-y-1 text-sm sm:text-base">
                        <span className="mb-2 text-lg font-bold sm:text-xl lg:mb-3">Contact Us</span>
                        <span>contact@photoscape.com</span>
                        <span>(021) - 2345678</span>
                        <span>Jakarta, Indonesia</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}
