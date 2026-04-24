"use client";

import PricingDetailTemplate from "@/components/pricing/PricingDetailTemplate";

export default function Page() {
  return (
    <PricingDetailTemplate
      title="Group Lite"
      description="Paket self-photo untuk kelompok kecil yang ingin berfoto secara mandiri dengan suasana santai dan fleksibel."
      price="120.000"
      benefits={[
        "Menggunakan Self-Photo Studio",
        "Menggunakan remote control",
        "3 foto fisik",
        "Aksesoris studio tersedia",
        "Durasi sesi 50 menit"
      ]}
      imageText="Group Lite"
      imageUrl="/paket/grouplite.jpg"
    />
  );
}
