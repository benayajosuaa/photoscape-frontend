"use client";

import { Montserrat } from "next/font/google";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { storeLoginSession } from "@/lib/auth-client";
import { apiFetchPublic } from "@/lib/api";
import { clearDashboardAuth, normalizeRole, setAuth } from "@/lib/auth";
import type { Role } from "@/types";

const monserratFont = Montserrat({
  subsets: ["latin"],
  weight: "500",
});

type LoginResponse = {
  token?: string;
  refreshToken?: string;
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
  message?: string;
};

const INTERNAL_ROLE_BY_EMAIL: Record<string, Role> = {
  "adminmedan@photoscape.com": "staff",
  "adminjakarta@photoscape.com": "staff",
  "adminsurabaya@photoscape.com": "staff",
  "manager@photoscape.com": "manager",
  "owner@photoscape.com": "owner",
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
      const json = await apiFetchPublic<LoginResponse>("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });
      if (!json.token || !json.user) throw new Error(json.error || json.message || "Login gagal");

      const normalizedEmail = (json.user.email || "").trim().toLowerCase();
      const normalizedRole = normalizeRole((json.user.role || "").trim().toLowerCase());
      const forcedRole = INTERNAL_ROLE_BY_EMAIL[normalizedEmail];
      const dashboardRole = forcedRole || normalizedRole;
      const isInternalAccount = Boolean(forcedRole);

      storeLoginSession({
        token: json.token,
        refreshToken: json.refreshToken,
        user: {
          ...json.user,
          role: isInternalAccount ? dashboardRole : "customer",
        },
      });

      if (isInternalAccount) {
        setAuth(json.token, {
          ...json.user,
          role: dashboardRole,
          isActive: true,
        });
        setSuccessMessage("Login internal berhasil. Mengalihkan ke dashboard...");

        if (dashboardRole === "owner") {
          router.push("/owner/dashboard");
        } else if (dashboardRole === "manager") {
          router.push("/dashboard/manager");
        } else {
          router.push("/dashboard/overview");
        }
      } else {
        clearDashboardAuth();
        setSuccessMessage("Login berhasil. Mengalihkan...");
        const redirect = searchParams.get("redirect");
        router.push(redirect && redirect.startsWith("/") ? redirect : "/");
      }
      router.refresh();
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(error.message || "Login gagal");
      } else {
        setErrorMessage("Login gagal");
      }
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
              <h1 className="text-3xl font-bold text-[#0B1957]">hai!</h1>
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

            <form onSubmit={handleSubmit} className="w-full rounded-3xl border bg-white p-6 sm:p-10">
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
