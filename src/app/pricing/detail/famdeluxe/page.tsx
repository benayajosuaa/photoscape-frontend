"use client";

import PricingDetailTemplate from "@/components/pricing/PricingDetailTemplate";

export default function Page() {
  return (
    <PricingDetailTemplate
      title="Family Deluxe"
      description="Pengalaman foto keluarga yang lebih spesial dengan layanan lebih lengkap untuk menghasilkan potret yang elegan dan berkesan."
      price="400.000"
      benefits={[
        "Durasi sesi 60 menit",
        "Maksimal 6 orang",
        "Semua file foto (softcopy)",
        "5 foto cetak premium",
        "Aksesoris studio tersedia",
      ]}
      imageText="Family Deluxe"
    />
  );
}
