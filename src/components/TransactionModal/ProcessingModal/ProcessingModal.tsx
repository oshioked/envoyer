import Button from "@/components/Button/Button"
import LoadingIndicator from "@/components/LoadingIndicator/LoadingIndicator"
import { usePendingSends } from "@/contexts/ActivityProvider/PendingSendsProvider/PendingSendsProvider"
import { useRecentSends } from "@/contexts/ActivityProvider/RecentSendsProvider/RecentSendsProvider"
import { formatAddress } from "@/utils/utils"
import Image from "next/image"
import React, { useEffect, useState } from "react"

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
  txHash: string | null
}
export const ProcessingModal = (props: ProcessingModalProps) => {
  const {
    isProcessing,
    confirmed,
    error,
    onClose,
    tokenSymbol,
    tokenURI,
    amount,
    toAddress,
    txHash,
  } = props

  const [displayedDetails, setDisplayedDetails] = useState({
    tokenSymbol,
    tokenURI,
    amount,
    toAddress,
  }) //Save these as initial state so when they reset on submitted the state remains

  const [success, setSuccess] = useState(false)
  const { recentSends } = useRecentSends()

  // const { speedUpSend } = useSendToken()

  useEffect(() => {
    //Check if in txHash in recent send
    const existing = recentSends.find((send) => send.txHash === txHash)
    if (existing) {
      setSuccess(true)
    }
  }, [recentSends, txHash])

  return (
    <>
      <div className="flex justify-between pb-[20px] border-b border-separator-2">
        <div />
        <div
          onClick={() => onClose()}
          className="flex items-center cursor-pointer"
        >
          <Image
            loading="eager"
            src="/icons/close.svg"
            width={28}
            height={28}
            alt=""
          />
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
          {success
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
