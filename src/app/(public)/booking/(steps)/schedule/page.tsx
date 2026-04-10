
import { Montserrat } from "next/font/google"
import Link from "next/link"
import { SlCalender } from "react-icons/sl";

const monserratFont = Montserrat({
  subsets: ["latin"],
  weight: "500",
})

export default function Home() {
  return (
    <div className={`${monserratFont.className} bg-white text-gray-900`}> 
       <div>
            <div>
                schedule
            </div>
       </div>
    </div>
  );
}
