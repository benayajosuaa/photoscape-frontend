"use client";

import PricingDetailTemplate from "@/components/pricing/PricingDetailTemplate";

export default function Page() {
  return (
    <PricingDetailTemplate
      title="Family Premium"
      description="Paket keluarga paling lengkap untuk momen istimewa dengan waktu sesi lebih panjang dan hasil lebih maksimal."
      price="630.000"
      benefits={[
        "Durasi sesi 90 menit",
        "Maksimal 8 orang",
        "Semua file foto (softcopy)",
        "10 foto cetak premium",
        "Aksesoris studio tersedia",
      ]}
      imageText="Family Premium"
    />
  );
}
