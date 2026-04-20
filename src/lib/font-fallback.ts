import {
  Geist as NextGeist,
  Geist_Mono as NextGeistMono,
  Montserrat as NextMontserrat,
} from "next/font/google";

type MontserratOptions = Parameters<typeof NextMontserrat>[0];
type GeistOptions = Parameters<typeof NextGeist>[0];
type GeistMonoOptions = Parameters<typeof NextGeistMono>[0];

const montserratFont = NextMontserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const geistFont = NextGeist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMonoFont = NextGeistMono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export function Montserrat(_options?: MontserratOptions) {
  return montserratFont;
}

export function Geist(_options?: GeistOptions) {
  return geistFont;
}

export function Geist_Mono(_options?: GeistMonoOptions) {
  return geistMonoFont;
}
