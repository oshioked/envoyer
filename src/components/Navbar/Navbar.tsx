import Image from "next/image"
import Link from "next/link"
import React from "react"
import Button from "../Button/Button"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAppChain } from "@/contexts/AppChainProvider/AppChainProvider"
import useIsMobile from "@/hooks/useIsMobile"

export const Navbar = () => {
  const { chain, setIsChainModalVisible, isSupportedChainConnected } =
    useAppChain()
  const isMobile = useIsMobile()
  return (
    <nav className="flex justify-between items-center border-b-2 border-separator-primary w-full px-[5%] h-[80px]">
      <Link href={"/"}>
        <div className="flex items-center gap-2">
          <Image
            loading="eager"
            src={"/icons/logo.svg"}
            width={35}
            height={13}
            alt=""
          />
          {/* <h4 className="hidden md:block font-semibold">Envoyer</h4> */}
        </div>
      </Link>

      {/* Buttons */}
      <div className="flex items-center gap-5">
        {
          <Button
            variant="tertiary"
            className="flex items-center gap-2 !px-3 !py-[10px]"
            onClick={() => setIsChainModalVisible(true)}
          >
            <Image src={chain.iconUrl} width={20} height={20} alt="" />
            <p className="hidden text-sm md:block">{chain.name}</p>
            <Image
              loading="eager"
              src={"/icons/chevDown.svg"}
              width={16}
              height={16}
              alt=""
            />
          </Button>
        }

        <ConnectButton
          accountStatus={isMobile ? "avatar" : "full"}
          showBalance={!isMobile}
          chainStatus={isSupportedChainConnected ? "none" : "full"}
        />
      </div>
    </nav>
  )
}

export default Navbar
