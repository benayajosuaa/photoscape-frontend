"use client"
import { useState } from "react"
import { IoMenu, IoClose } from "react-icons/io5"
import { Montserrat } from "next/font/google"
import { usePathname } from "next/navigation"
import Link from "next/link"

const monserratFont = Montserrat({
  subsets: ["latin"],
  weight: "400",
})

export default function NavigationBar() {

  return (
    <div className={`${monserratFont.className}`}>
        <div className="flex flex-row justify-between p-5 pl-10 pr-10 bg-[#0B1957] font-semibold text-lg text-[#FA9EBC] items-center">
            <div>
                <img className="h-10 w-auto" src="/logo/logo1.png" alt="" />
            </div>
            <div className="flex flex-row gap-20">
                <span>Home</span>
                <span>Pricing</span>
                <span>Gallery</span>
                <span>Booking</span>
                <span>Contact Us</span>
            </div>
            <div>
                <span className="bg-[#FA9EBC] text-[#0B1957] p-2 pl-6 pr-6 font-semibold rounded-xl">Login</span>
            </div>
        </div>
    </div>
  )
}