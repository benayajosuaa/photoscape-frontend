"use client"
import Link from "next/link"
import { Montserrat } from "next/font/google"

const monserratFont = Montserrat({
  subsets: ["latin"],
  weight: "400",
})

export default function NavigationBar() {

  return (
    <div className={`${monserratFont.className}`}>
        <div className="flex flex-row justify-between p-5 pl-10 pr-10 bg-[#0B1957] text-lg text-[#FA9EBC] items-center">
            <div className="p-10 w-full">
                <div className="flex flex-row gap-x-10 justify-between w-full">
                    <div className="flex flex-col">
                        <div className="mb-4">
                            <img className="h-10 w-auto" src="/logo/logo1.png" alt="" />
                        </div>
                        <div>
                            <span>
                                <p>Kami mendedikasikan setiap jepretan untuk <br/> menceritakan kisah unik Anda dengan kualitas <br/> terbaik sejak 2022.</p>
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-y-1">
                        <span className="font-bold text-xl mb-3">Menu</span>
                        <span><Link href="/">Home</Link></span>
                        <span><Link href="/pricing">Pricing</Link></span>
                        <span><Link href="/gallery">Gallery</Link></span>
                        <span><Link href="/booking/book">Booking</Link></span>
                        <span><Link href="/contact-us">Contact Us</Link></span>
                    </div>
                    <div className="flex flex-col gap-y-1">
                        <span className="font-bold text-xl mb-3">Contact Us</span>
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
