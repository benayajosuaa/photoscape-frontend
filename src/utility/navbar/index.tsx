"use client"
import Link from "next/link"
import { Montserrat } from "next/font/google"
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const token = getStoredToken();

    try {
      if (token) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch {
      // Ignore network/logout API errors and continue clearing client session.
    } finally {
      clearLoginSession();
      setUser(null);
      setMenuOpen(false);
      router.push("/login");
      router.refresh();
    }
  };

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
            <div ref={menuRef} className="relative">
                {user ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setMenuOpen(prev => !prev)}
                      className="bg-[#FA9EBC] text-[#0B1957] p-2 pl-6 pr-6 font-semibold rounded-xl"
                    >
                      {getFirstName(user.name)}
                    </button>
                    {menuOpen && (
                      <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-[#f3bfd3] bg-white shadow-lg">
                        <Link
                          href="/booking/history"
                          className="block px-4 py-3 text-[16px] font-semibold text-[#0B1957] hover:bg-[#fdebf2]"
                          onClick={() => setMenuOpen(false)}
                        >
                          Riwayat Booking
                        </Link>
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="block w-full px-4 py-3 text-left text-[16px] font-semibold text-[#B33362] hover:bg-[#fdebf2]"
                        >
                          Log Out
                        </button>
                      </div>
                    )}
                  </>
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
