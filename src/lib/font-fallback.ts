import {
  Geist as NextGeist,
  Geist_Mono as NextGeistMono,
  Montserrat as NextMontserrat,
} from "next/font/google";

type MontserratOptions = Parameters<typeof NextMontserrat>[0];
type GeistOptions = Parameters<typeof NextGeist>[0];
type GeistMonoOptions = Parameters<typeof NextGeistMono>[0];

export function Montserrat(options?: MontserratOptions) {
  return NextMontserrat({
    subsets: ["latin"],
    ...options,
  });
}

export function Geist(options?: GeistOptions) {
  return NextGeist({
    subsets: ["latin"],
    ...options,
  });
}

export function Geist_Mono(options?: GeistMonoOptions) {
  return NextGeistMono({
    subsets: ["latin"],
    ...options,
  });
}
