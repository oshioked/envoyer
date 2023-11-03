import Button from "@/components/Button/Button"
import LoadingIndicator from "@/components/LoadingIndicator/LoadingIndicator"
import { useAppChain } from "@/contexts/AppChainProvider/AppChainProvider"
import useLocalStorageState from "@/hooks/useLocalStorageState"
import useSendToken from "@/hooks/useSendToken"
import { formatAddress } from "@/utils/utils"
import Image from "next/image"
import React, { useState } from "react"

const ConfirmSendModal = (props: {
  tokenURI: string
  setIsOpen: (isOpen: boolean) => void
  amount: number
  tokenAddress: string
  toAddress: string
  sendToken: (
    tokenContractAddress: `0x${string}`,
    amount: string,
    to: `0x${string}`
  ) => Promise<void>
  isLoading: boolean
  resetForm?: Function
}) => {
  const { amount, setIsOpen, tokenURI, tokenAddress, toAddress, resetForm } =
    props
  const [showGasOptions, setShowGasOptions] = useLocalStorageState(
    "showGasOptions",
    false
  )
  const [selectedGasOption, setSelectedGasOption] = useLocalStorageState<
    "Low" | "Market" | "Aggressive"
  >("selectedGasOption", "Low")

  const { sendToken, isLoading, success, error, confirmed } = useSendToken({
    onSuccess: resetForm || (() => {}),
  })
  const { chain } = useAppChain()

  return (
    <>
      <div className="flex justify-between pb-[20px] border-b border-[#FFFFFF33]">
        <h3 className="text-lg font-bold opacity-75">Confirm send</h3>
        <div
          onClick={() => setIsOpen(false)}
          className="flex items-center cursor-pointer"
        >
          <Image src="/icons/close.svg" width={28} height={28} alt="" />
        </div>
      </div>

      <div className="flex justify-between items-center pb-[20px] border-b border-[#FFFFFF33]">
        <div className="flex flex-col gap-2">
          <p className="text-xs opacity-50">SEND</p>
          <div className="flex items-center gap-[8px]">
            <Image
              className="w-[25px] h-[25px] rounded-full"
              src={tokenURI || ""}
              width={25}
              height={25}
              alt=""
            />
            <h3 className="text-xl font-bold">{amount}</h3>
          </div>
        </div>

        <div className="flex flex-col gap-2 items-end">
          <p className="text-xs  opacity-50">TO</p>
          <h3 className="text-xl font-bold">{formatAddress(toAddress)}</h3>
        </div>
      </div>

      <div className="flex flex-col gap-5 pb-[15px]">
        <div className="flex justify-between items-center">
          <p className="opacity-50">Network</p>
          <div>
            <Button
              className="flex items-center rounded-[12px] gap-1 !py-2 !px-2 opacity-60"
              variant="disabled"
            >
              <Image src={chain.iconUrl} width={16} height={16} alt="" />
              <p className="text-xs font-normal text-white">{chain.name}</p>
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <p className="opacity-50">Network fee</p>
          <p>$0.5</p>
        </div>
        <div className="flex justify-between items-center">
          <p className="opacity-50">Est time</p>
          <p>{"< 2mins"}</p>
        </div>
        <div
          onClick={() => setShowGasOptions(!showGasOptions)}
          className="flex justify-end items-center cursor-pointer"
        >
          <p className="text-xs text-[#6FEABB]">
            {showGasOptions ? "Done" : "See other options"}
          </p>
        </div>
        {showGasOptions && (
          <div className="flex bg-[#303947] h-11 gap-[5px] p-[5px] rounded-[15px]">
            {["Low", "Market", "Aggressive"].map((a, i) => (
              <Button
                key={i}
                className={`text-xs rounded-[10px] !p-0 flex-1 ${
                  a !== selectedGasOption ? "!bg-transparent" : ""
                }`}
                onClick={() => setSelectedGasOption(a as any)}
                variant="tertiary"
              >
                {a}
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto">
        {isLoading ? (
          <div className="flex items-center w-full gap-5">
            <Button className="flex-1" variant="disabled">
              {success
                ? "Sent successfully"
                : error
                ? error
                : !confirmed
                ? "Complete in your wallet"
                : "Submitted. Processing"}
            </Button>
            <div>
              <LoadingIndicator
                className="h-9 w-9"
                isLoading={true}
                success={Boolean(success)}
                error={Boolean(error)}
              />
            </div>
          </div>
        ) : (
          <Button
            onClick={() =>
              sendToken(
                tokenAddress as `0x${string}`,
                amount.toString(),
                toAddress as `0x${string}`
              )
            }
            className="w-full"
            variant="primary"
          >
            Confirm send
          </Button>
        )}
      </div>
    </>
  )
}

export default ConfirmSendModal
