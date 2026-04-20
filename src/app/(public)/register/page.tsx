"use client";

import { Montserrat } from "@/lib/font-fallback";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { API_BASE_URL } from "@/lib/auth-client";

const monserratFont = Montserrat({
  subsets: ["latin"],
  weight: "500",
});

type RegisterResponse = {
  message?: string;
  error?: string;
  email?: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      const json = (await response.json()) as RegisterResponse;

      if (!response.ok) {
        throw new Error(json.error || "Registrasi gagal");
      }

      setOtpStep(true);
      setSuccessMessage(
        json.message || "Akun sementara dibuat. Silakan cek email untuk OTP, lalu verifikasi di bawah."
      );
    } catch (error: any) {
      setErrorMessage(error.message || "Registrasi gagal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
        }),
      });

      const json = (await response.json()) as RegisterResponse;

      if (!response.ok) {
        throw new Error(json.error || "Verifikasi OTP gagal");
      }

      setSuccessMessage("Registrasi berhasil. Silakan login.");
      router.push("/login");
    } catch (error: any) {
      setErrorMessage(error.message || "Verifikasi OTP gagal");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${monserratFont.className}`}>
      <div className="min-h-screen w-auto bg-[#F8C6D673] px-4 py-8">
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex w-full max-w-[520px] flex-col items-center gap-y-6">
            <div>
              <h1 className="text-3xl font-bold font-[#0B1957]">daftar yuk</h1>
            </div>

            {(errorMessage || successMessage) && (
              <div
                className={`w-full rounded-xl border px-5 py-3 text-sm ${
                  errorMessage
                    ? "border-[#FA9EBC] bg-[#fdebf2] text-[#B33362]"
                    : "border-[#b8e7d0] bg-[#edf9f2] text-[#25734c]"
                }`}
              >
                {errorMessage || successMessage}
              </div>
            )}

            {!otpStep ? (
              <form onSubmit={handleRegister} className="w-full rounded-3xl border bg-white p-6 sm:p-10">
                <div className="flex flex-col gap-y-8">
                  <span className="flex flex-col gap-y-2">
                    <label htmlFor="name">Nama</label>
                    <input
                      id="name"
                      className="border-b p-2"
                      placeholder="nama lengkap kamu"
                      type="text"
                      value={name}
                      onChange={event => setName(event.target.value)}
                      required
                    />
                  </span>
                  <span className="flex flex-col gap-y-2">
                    <label htmlFor="email">Email</label>
                    <input
                      id="email"
                      className="border-b p-2"
                      placeholder="nama@domain.kamu"
                      type="email"
                      value={email}
                      onChange={event => setEmail(event.target.value)}
                      required
                    />
                  </span>
                  <span className="flex flex-col gap-y-2">
                    <label htmlFor="password">Password</label>
                    <input
                      id="password"
                      className="border-b p-2"
                      placeholder="pastikan kombinasi yang sulit ya"
                      type="password"
                      value={password}
                      onChange={event => setPassword(event.target.value)}
                      required
                    />
                  </span>
                </div>

                <div className="mt-10 text-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`rounded-lg px-9 py-1 text-xl text-white ${
                      isSubmitting ? "cursor-not-allowed bg-[#52608f]" : "bg-[#0B1957]"
                    }`}
                  >
                    {isSubmitting ? "Loading..." : "Registrasi"}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="w-full rounded-3xl border bg-white p-6 sm:p-10">
                <div className="flex flex-col gap-y-8">
                  <span className="flex flex-col gap-y-2">
                    <label htmlFor="otp">Kode OTP</label>
                    <input
                      id="otp"
                      className="border-b p-2"
                      placeholder="masukkan OTP dari email"
                      type="text"
                      value={otp}
                      onChange={event => setOtp(event.target.value)}
                      required
                    />
                  </span>
                </div>

                <div className="mt-10 text-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`rounded-lg px-9 py-1 text-xl text-white ${
                      isSubmitting ? "cursor-not-allowed bg-[#52608f]" : "bg-[#0B1957]"
                    }`}
                  >
                    {isSubmitting ? "Loading..." : "Verifikasi OTP"}
                  </button>
                </div>
              </form>
            )}

            <div>
              <div className="flex flex-row">
                <span className="mr-1">sudah punya akun ? </span>
                <span className="mr-1">bisa langsung </span>
                <span>
                  <Link href="/login" className="underline">
                    login aja
                  </Link>
                </span>
              </div>
            </div>
            <div>
              <span>
                <Link href="/">Home</Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
