"use client";

import Link from "next/link";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { Montserrat } from "@/lib/font-fallback";
import Navbar from "@/utility/navbar";
import Footer from "@/utility/footer";

type PricingDetailTemplateProps = {
  title: string;
  description: string;
  price: string;
  benefits: string[];
  imageText?: string;
};

const monserratFont = Montserrat({
  subsets: ["latin"],
  weight: "500",
});

export default function PricingDetailTemplate(props: PricingDetailTemplateProps) {
  const { title, description, price, benefits, imageText = "Preview Paket" } = props;

  return (
    <div className={`${monserratFont.className} min-h-screen bg-white text-gray-900`}>
      <div className="fixed top-0 z-50 w-full">
        <Navbar />
      </div>

      <main className="mx-auto w-full max-w-7xl px-4 pb-14 pt-24 sm:px-8 sm:pt-28 lg:px-12 lg:pt-32">
        <div className="mb-6 text-base sm:mb-8 sm:text-lg">
          <Link href="/pricing" className="inline-flex items-center gap-x-2 font-semibold text-gray-500 hover:text-[#0B1957]">
            <MdOutlineKeyboardBackspace />
            <span>Kembali</span>
          </Link>
        </div>

        <section className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start lg:gap-12">
          <div className="overflow-hidden rounded-3xl border border-[#e5d4dc] bg-[#f7edf2]">
            <div className="flex aspect-[4/3] w-full items-center justify-center px-6 text-center text-base font-medium text-[#6b4f5c] sm:text-lg">
              {imageText}
            </div>
          </div>

          <div className="text-left">
            <h1 className="mb-4 text-3xl font-bold text-[#0B1957] sm:text-4xl">{title}</h1>
            <p className="mb-6 text-base leading-relaxed text-[#515151] sm:text-lg">{description}</p>

            <div className="mb-8 flex items-end gap-x-2 text-[#0B1957]">
              <span className="text-xl font-semibold text-[#515151]">Rp</span>
              <span className="text-4xl font-bold sm:text-5xl">{price}</span>
            </div>

            <div className="rounded-2xl border border-[#e6d8de] bg-[#fcf7fa] p-5 sm:p-6">
              <h2 className="mb-3 text-xl font-semibold text-[#0B1957] sm:text-2xl">Apa yang didapatkan</h2>
              <ul className="list-disc space-y-2 pl-5 text-base text-[#515151] sm:text-lg">
                {benefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

