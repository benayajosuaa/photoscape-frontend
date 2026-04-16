"use client"
import Link from "next/link"
import { Montserrat } from "next/font/google"
import { useEffect, useState } from "react";
import {
  API_BASE_URL,
  AuthUser,
  clearLoginSession,
  getFirstName,
  getStoredToken,
  getStoredUser,
} from "@/lib/auth-client";

const monserratFont = Montserrat({
  subsets: ["latin"],
  weight: "400",
})

export default function NavigationBar() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const token = getStoredToken();
    const cachedUser = getStoredUser();

    if (!token) {
      setUser(null);
      return;
    }

    if (cachedUser) {
      setUser(cachedUser);
    }

    const controller = new AbortController();

    const fetchMe = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        const json = (await response.json()) as {
          user?: AuthUser;
          error?: string;
        };

        if (!response.ok || !json.user) {
          clearLoginSession();
          setUser(null);
          return;
        }

        window.localStorage.setItem("authUser", JSON.stringify(json.user));
        setUser(json.user);
      } catch {
        // Keep cached user if request fails, but do nothing.
      }
    };

    void fetchMe();

    return () => controller.abort();
  }, []);

  return (
    <div className={`${monserratFont.className}`}>
        <div className="flex flex-row justify-between p-5 pl-10 pr-10 bg-[#0B1957] font-semibold text-lg text-[#FA9EBC] items-center">
            <div>
                <img className="h-10 w-auto" src="/logo/logo1.png" alt="" />
            </div>
            <div className="flex flex-row gap-20">
                <span><Link href="/">Home</Link></span>
                <span><Link href="/pricing">Pricing</Link></span>
                <span><Link href="/gallery">Gallery</Link></span>
                <span><Link href="/booking/book">Booking</Link></span>
                <span><Link href="/contact-us">Contact Us</Link></span>
                
            </div>
            <div>
                {user ? (
                  <span className="bg-[#FA9EBC] text-[#0B1957] p-2 pl-6 pr-6 font-semibold rounded-xl">
                    {getFirstName(user.name)}
                  </span>
                ) : (
                  <span className="bg-[#FA9EBC] text-[#0B1957] p-2 pl-6 pr-6 font-semibold rounded-xl">
                    <Link href="/login">Login</Link>
                  </span>
                )}
            </div>
        </div>
    </div>
  )
}
