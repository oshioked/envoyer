import Image from "next/image"
import Link from "next/link"
import React from "react"
import Button from "../Button/Button"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAppChain } from "@/contexts/AppChainProvider/AppChainProvider"

export const Navbar = () => {
  const { chain, setIsChainModalVisible } = useAppChain()
  return (
    <nav className="flex justify-between items-center border-b-2 border-[#202733] w-full px-[5%] h-[80px]">
      <Link href={"/"}>
        <div className="flex">
          <Image src={"/icons/logo.svg"} width={43} height={36} alt="" />
          <h4>Envoyer</h4>
        </div>
      </Link>

      {/* Buttons */}
      <div className="flex items-center gap-5">
        <Button
          variant="tertiary"
          className="flex items-center gap-2 !px-3 !py-[10px]"
          onClick={() => setIsChainModalVisible(true)}
        >
          <Image src={chain.iconUrl} width={20} height={20} alt="" />
          <p className=" text-sm">{chain.name}</p>
          <Image src={"/icons/chevDown.svg"} width={16} height={16} alt="" />
        </Button>

        <ConnectButton chainStatus="none" />
      </div>
    </nav>
  )
}

export default Navbar
