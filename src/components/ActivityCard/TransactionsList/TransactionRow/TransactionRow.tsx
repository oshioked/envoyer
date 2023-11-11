import StatusDotIndicator from "@/components/StatusDotIndicator/StatusDotIndicator"
import {
  SendData,
  SendStatus,
} from "@/contexts/ActivityProvider/ActivityProvider"
import { weiToEther } from "@/utils/tokens"
import { formatAddress, formatIpfsImage, formatShortDate } from "@/utils/utils"
import Image from "next/image"
import React from "react"
import Skeleton from "react-loading-skeleton"

const TransactionRow = (props: {
  onTransactionClick: (txHash: string) => void
  send: SendData
  token: Token
  listIndex: number
  status: SendStatus
}) => {
  const { send, token, listIndex, status, onTransactionClick } = props
  const amount = token
    ? Number(weiToEther(Number(send.tokenAmt), token.decimals)).toFixed(4)
    : ""

  return !token ? null : (
    <div
      onClick={() => onTransactionClick(send.txHash)}
      className={`flex justify-between items-center p-4 ${
        listIndex !== 0 ? "border-t" : ""
      } border-separator-2 transition-colors md:hover:bg-background-primary cursor-pointer`}
    >
      <div className="flex items-center gap-2">
        <Image
          className="rounded-full"
          src={formatIpfsImage(token.logoURI)}
          width={27}
          height={27}
          alt=""
        />
        <div>
          <h3>{status === "processing" ? "Sending" : "Sent"}</h3>
          <p className="text-[13px] opacity-50">{`${amount} ${
            token.symbol
          } to ${formatAddress(send.to)}`}</p>
        </div>
      </div>
      <div className="flex flex-col items-end justify-between gap-2">
        <StatusDotIndicator status={status} />
        <p className="text-[13px] opacity-50">
          {send.time ? formatShortDate(new Date(send.time)) : ""}
        </p>
      </div>
    </div>
  )
}

export const TransactionRowLoading = (props: { listIndex: number }) => {
  const { listIndex } = props
  return (
    <div
      className={`flex justify-between items-center p-4 ${
        listIndex !== 0 ? "border-t" : ""
      } border-separator-0`}
    >
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 mt-[-4px]">
          <Skeleton circle containerClassName="w-7 h-7" className="w-7 h-7" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="w-[60px] h-3">
            <Skeleton />
          </div>
          <div className="w-[140px]">
            <Skeleton className="w-[100px] h-[10px]" />
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end justify-between">
        <div />
        <div className="w-5 h-2">
          <Skeleton className="h-[10px]" />
        </div>
      </div>
    </div>
  )
}

export default TransactionRow
