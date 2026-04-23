"use client";

import PricingDetailTemplate from "@/components/pricing/PricingDetailTemplate";

export default function Page() {
  return (
    <PricingDetailTemplate
      title="Family Lite"
      description="Paket foto keluarga hemat dengan hasil tetap profesional untuk mengabadikan momen kebersamaan."
      price="220.000"
      benefits={[
        "Durasi sesi 60 menit",
        "Maksimal 4 orang",
        "Semua file foto (softcopy)",
        "3 foto cetak",
        "Aksesoris studio tersedia",
      ]}
      imageText="Family Lite"
      imageUrl="/paket/famlite.jpg"
    />
  );
}
