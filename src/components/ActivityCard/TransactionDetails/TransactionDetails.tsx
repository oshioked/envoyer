import Button from "@/components/Button/Button"
import StatusDotIndicator from "@/components/StatusDotIndicator/StatusDotIndicator"
import { SEND_STATUS } from "@/constants/send"
import { useAppChain } from "@/contexts/AppChainProvider/AppChainProvider"
import { useErc20Tokens } from "@/contexts/Erc20TokensProvider/Erc20TokensProvider"
import { PendingSend } from "@/contexts/ActivityProvider/PendingSendsProvider/PendingSendsProvider"
import { RecentSend } from "@/contexts/ActivityProvider/RecentSendsProvider/RecentSendsProvider"
import {
  formatAddress,
  formatIpfsImage,
  formatShortDate,
  weiToEther,
} from "@/utils/utils"
import Image from "next/image"
import { useRouter } from "next/router"
import React from "react"

const TransactionDetails = (props: {
  onBack: Function
  selectedSendTx?: PendingSend | RecentSend
}) => {
  const { onBack, selectedSendTx } = props
  const tokenList = useErc20Tokens()
  const token = selectedSendTx
    ? tokenList[selectedSendTx.tokenAddress.toLowerCase()]
    : {}
  const { chain } = useAppChain()

  const txExplorerLink = `${chain.blockExplorers.default.url}/tx/${selectedSendTx?.txHash}`

  return !token || !token.symbol || !selectedSendTx ? null : (
    <div className="p-5 flex flex-col gap-[15px] flex-1  text-[#ffffff79]">
      <div className="flex justify-between pb-[15px] border-b border-[#FFFFFF33] text-sm">
        <div
          onClick={() => onBack()}
          className="flex items-center cursor-pointer"
        >
          <Image src="/icons/back.svg" width={17} height={17} alt="" />
          <p className="font-bold">Activity</p>
        </div>
        <p>
          {selectedSendTx.time
            ? formatShortDate(new Date(selectedSendTx.time))
            : ""}
        </p>
      </div>

      <div className="flex justify-between items-center pb-[15px] border-b border-[#FFFFFF33]">
        <div className="flex flex-col gap-[4px]">
          <p className="text-xs">SEND</p>
          <div className="flex items-center gap-1">
            <Image
              className="w-5 h-5"
              src={formatIpfsImage(token.logoURI) || ""}
              width={20}
              height={20}
              alt=""
            />
            <h3 className="text-lg font-bold text-white">
              {weiToEther(Number(selectedSendTx.tokenAmt), token.decimals)}
            </h3>
          </div>
        </div>
        <div className="flex flex-col gap-[4px] items-end">
          <p className="text-xs">TO</p>
          <h3 className="text-lg font-bold text-white">
            {formatAddress(selectedSendTx?.to)}
          </h3>
        </div>
      </div>
      <div className="flex flex-col gap-[15px] pb-[15px] text-[15px] border-b border-[#FFFFFF33]">
        <div className="flex justify-between items-center">
          <p>Transaction hash</p>
          <p className="text-white">{formatAddress(selectedSendTx.txHash)}</p>
        </div>
        <div className="flex justify-between items-center">
          <p>Status</p>
          <div className="flex items-center gap-2">
            <p className="text-white">
              {selectedSendTx.status === "processing"
                ? "Processing"
                : "Completed"}
            </p>
            <StatusDotIndicator status={selectedSendTx.status} />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <p>Network fee</p>
          <p className="text-white">Low ($1.05)</p>
        </div>
      </div>
      {/* <div>
        <p>Speed up this transaction by increasing the network fee</p>
      </div> */}
      <div className="mt-auto">
        {selectedSendTx.status === SEND_STATUS.success ? (
          <Button
            onClick={() => window.open(txExplorerLink)}
            className="w-full"
            variant="secondary"
          >
            View on explorer
          </Button>
        ) : (
          <Button className="w-full" variant="secondary">
            Speed up transaction
          </Button>
        )}
      </div>
    </div>
  )
}

export default TransactionDetails
