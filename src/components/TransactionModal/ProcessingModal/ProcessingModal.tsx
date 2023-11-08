import Button from "@/components/Button/Button"
import LoadingIndicator from "@/components/LoadingIndicator/LoadingIndicator"
import { formatAddress } from "@/utils/utils"
import Image from "next/image"
import React, { useState } from "react"

interface ProcessingModalProps {
  tokenSymbol: string
  tokenURI: string
  amount: string
  toAddress: string
  isProcessing: boolean
  confirmed: boolean
  success: boolean
  error: string
  onClose: Function
}
export const ProcessingModal = (props: ProcessingModalProps) => {
  const {
    isProcessing,
    confirmed,
    success,
    error,
    onClose,
    tokenSymbol,
    tokenURI,
    amount,
    toAddress,
  } = props

  const [displayedDetails, setDisplayedDetails] = useState({
    tokenSymbol,
    tokenURI,
    amount,
    toAddress,
  }) //Save these as initial state so when they reset on submitted the state remains

  return (
    <>
      <div className="flex justify-between pb-[20px] border-b border-[#FFFFFF33]">
        {/* <h3 className="text-lg font-bold opacity-75">Confirm send</h3> */}
        <div />
        <div
          onClick={() => onClose()}
          className="flex items-center cursor-pointer"
        >
          <Image src="/icons/close.svg" width={28} height={28} alt="" />
        </div>
      </div>
      <div className="flex flex-col flex-1 items-center justify-center w-full gap-5">
        <div className="flex justify-between items-center pb-[20px] w-full">
          <div className="flex flex-col gap-2">
            <p className="text-xs opacity-50">
              SEND {displayedDetails.tokenSymbol}
            </p>
            <div className="flex items-center gap-[8px]">
              <Image
                className="w-[25px] h-[25px] rounded-full"
                src={displayedDetails.tokenURI || ""}
                width={25}
                height={25}
                alt=""
              />
              <h3 className="text-xl font-bold">{displayedDetails.amount}</h3>
            </div>
          </div>

          <div className="flex flex-col gap-2 items-end">
            <p className="text-xs  opacity-50">TO</p>
            <h3 className="text-xl font-bold">
              {formatAddress(displayedDetails.toAddress)}
            </h3>
          </div>
        </div>
        <div>
          <LoadingIndicator
            className="h-9 w-9"
            isLoading={isProcessing}
            success={confirmed}
            error={Boolean(error)}
          />
        </div>
        <Button className="w-full cursor-default" variant="disabled">
          {success || false //TODO - Check just confirmed send state for tx hash and show send if it's found
            ? "Sent successfully"
            : error
            ? error
            : !confirmed
            ? "Complete in your wallet"
            : "Submitted. Processing"}
        </Button>
      </div>
    </>
  )
}
