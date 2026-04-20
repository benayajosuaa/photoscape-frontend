"use client";

import PricingDetailTemplate from "@/components/pricing/PricingDetailTemplate";

export default function Page() {
  return (
    <PricingDetailTemplate
      title="Box Basic"
      description="Paket photo box cepat dan praktis untuk momen spontan bersama pasangan atau teman."
      price="40.000"
      benefits={[
        "Durasi sesi singkat",
        "Maksimal 2 orang",
        "Softcopy foto via QR / email",
        "Aksesoris sederhana tersedia",
      ]}
      imageText="Box Basic"
    />
  );
}
