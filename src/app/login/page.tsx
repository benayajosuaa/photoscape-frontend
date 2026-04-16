"use client";

import { Montserrat } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { API_BASE_URL, storeLoginSession } from "@/lib/auth-client";

const monserratFont = Montserrat({
  subsets: ["latin"],
  weight: "500",
});

type LoginResponse = {
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    locationId: string | null;
    location: {
      id: string;
      name: string;
    } | null;
  };
  error?: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const json = (await response.json()) as LoginResponse;

      if (!response.ok || !json.token || !json.user) {
        throw new Error(json.error || "Login gagal");
      }

      storeLoginSession({
        token: json.token,
        user: json.user,
      });

      setSuccessMessage("Login berhasil. Mengalihkan...");
      router.push("/");
      router.refresh();
    } catch (error: any) {
      setErrorMessage(error.message || "Login gagal");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${monserratFont.className}`}>
      <div className="h-screen w-auto bg-[#F8C6D673]">
        <div className="flex h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-y-6">
            <div>
              <h1 className="text-3xl font-bold font-[#0B1957]">hai!</h1>
            </div>

            {(errorMessage || successMessage) && (
              <div
                className={`w-120 rounded-xl border px-5 py-3 text-sm ${
                  errorMessage
                    ? "border-[#FA9EBC] bg-[#fdebf2] text-[#B33362]"
                    : "border-[#b8e7d0] bg-[#edf9f2] text-[#25734c]"
                }`}
              >
                {errorMessage || successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="w-120 rounded-3xl border bg-white p-10">
              <div className="flex flex-col gap-y-10">
                <span className="flex flex-col gap-y-2">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    className="border-b p-2"
                    placeholder="nama@email.mu"
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
                    placeholder="masukin password kamu"
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
                  {isSubmitting ? "Loading..." : "Login"}
                </button>
              </div>
            </form>

            <div>
              <div className="flex flex-row">
                <span className="mr-1">belum punya akun ? </span>
                <span className="mr-1">bisa daftar </span>
                <span>
                  <Link href="/register" className="underline">
                    disini
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
