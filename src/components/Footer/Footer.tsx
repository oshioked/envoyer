import Image from "next/image"
import Link from "next/link"
import React from "react"

export const Footer = () => {
  return (
    <footer className="flex justify-between items-center border-t-2 border-[#202733] w-full px-[5%] h-[80px]">
      <Link href={"/"}>
        <Image
          src={"/icons/logo.svg"}
          loading="eager"
          width={23}
          height={16}
          alt=""
        />
      </Link>

      <div className="flex gap-5"></div>
    </footer>
  )
}

export default Footer
