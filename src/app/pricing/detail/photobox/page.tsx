"use client";

import PricingDetailTemplate from "@/components/pricing/PricingDetailTemplate";

export default function Page() {
  return (
    <PricingDetailTemplate
      title="Photo Box Moments"
      description="Paket foto cepat dan seru untuk anak muda atau teman-teman yang ingin mengabadikan momen singkat dengan gaya santai."
      price="40.000"
      benefits={[
        "Menggunakan ruang Photo Box",
        "Durasi sesi singkat",
        "Softcopy foto via QR / email",
        "Aksesoris foto tersedia",
      ]}
      imageText="Photo Box Moments"
    />
  );
}
