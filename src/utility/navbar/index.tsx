"use client"
import Link from "next/link"
import { Montserrat } from "next/font/google"
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IoMenu, IoClose } from "react-icons/io5";
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
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
      setMobileNavOpen(false);
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <div className={`${monserratFont.className}`}>
        <div className="relative flex items-center justify-between bg-[#0B1957] px-4 py-4 text-[#FA9EBC] sm:px-6 lg:px-10 lg:py-5">
            <div>
                <img className="h-8 w-auto sm:h-9 lg:h-10" src="/logo/logo1.png" alt="" />
            </div>
            <div className="hidden flex-row gap-8 text-sm font-semibold lg:flex lg:gap-14 xl:gap-20 lg:text-lg">
                <span><Link href="/">Home</Link></span>
                <span><Link href="/pricing">Pricing</Link></span>
                <span><Link href="/gallery">Gallery</Link></span>
                <span><Link href="/booking/book">Booking</Link></span>
                <span><Link href="/contact-us">Contact Us</Link></span>
                
            </div>
            <div className="flex items-center gap-3">
            <div ref={menuRef} className="relative">
                {user ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setMenuOpen(prev => !prev)}
                      className="rounded-xl bg-[#FA9EBC] px-3 py-1.5 text-sm font-semibold text-[#0B1957] sm:px-6 sm:py-2 sm:text-base"
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
                  <span className="rounded-xl bg-[#FA9EBC] px-3 py-1.5 text-sm font-semibold text-[#0B1957] sm:px-6 sm:py-2 sm:text-base">
                    <Link href="/login">Login</Link>
                  </span>
                )}
            </div>
            <button
              type="button"
              className="rounded-md p-1 text-[#FA9EBC] lg:hidden"
              onClick={() => setMobileNavOpen(prev => !prev)}
              aria-label="Toggle navigation"
            >
              {mobileNavOpen ? <IoClose className="text-[26px]" /> : <IoMenu className="text-[26px]" />}
            </button>
            </div>
            {mobileNavOpen && (
              <div className="absolute left-0 right-0 top-full z-40 border-t border-[#273782] bg-[#0B1957] px-4 py-3 lg:hidden">
                <div className="flex flex-col gap-3 text-sm font-semibold">
                  <Link href="/" onClick={() => setMobileNavOpen(false)}>Home</Link>
                  <Link href="/pricing" onClick={() => setMobileNavOpen(false)}>Pricing</Link>
                  <Link href="/gallery" onClick={() => setMobileNavOpen(false)}>Gallery</Link>
                  <Link href="/booking/book" onClick={() => setMobileNavOpen(false)}>Booking</Link>
                  <Link href="/contact-us" onClick={() => setMobileNavOpen(false)}>Contact Us</Link>
                </div>
              </div>
            )}
        </div>
    </div>
  )
}
