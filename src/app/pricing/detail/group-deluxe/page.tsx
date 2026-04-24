"use client";

import PricingDetailTemplate from "@/components/pricing/PricingDetailTemplate";

export default function Page() {
  return (
    <PricingDetailTemplate
      title="Group Deluxe"
      description="Paket self-photo terbaik untuk grup yang lebih besar dengan durasi sesi lebih panjang dan hasil foto lebih lengkap."
      price="200.000"
      benefits={[
        "Menggunakan Self-Photo Studio",
        "Menggunakan remote control",
        "Semua file foto (softcopy)",
        "5 foto fisik",
        "Maksimal 3 background",
        "Aksesoris studio tersedia",
        "Durasi sesi 50 menit"
      ]}
      imageText="Group Deluxe"
      imageUrl="/paket/groupdeluxe.jpg"
    />
  );
}
