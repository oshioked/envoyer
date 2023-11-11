import Button from "@/components/Button/Button"
import StatusDotIndicator from "@/components/StatusDotIndicator/StatusDotIndicator"
import { SEND_STATUS } from "@/constants/send"
import { SendData } from "@/contexts/ActivityProvider/ActivityProvider"
import { usePendingSends } from "@/contexts/ActivityProvider/PendingSendsProvider/PendingSendsProvider"
import { useRecentSends } from "@/contexts/ActivityProvider/RecentSendsProvider/RecentSendsProvider"
import { useAppChain } from "@/contexts/AppChainProvider/AppChainProvider"
import { useErc20Tokens } from "@/contexts/Erc20TokensListProvider/Erc20TokensListProvider"
import useSendToken from "@/hooks/useSendToken"
import { weiToEther } from "@/utils/tokens"
import { formatAddress, formatIpfsImage, formatShortDate } from "@/utils/utils"
import Image from "next/image"
import React, { useMemo } from "react"

const TransactionDetails = (props: {
  onBack: Function
  populateSend: (send: SendData) => void
  selectedSendTxHash?: string
}) => {
  const { onBack, selectedSendTxHash, populateSend } = props
  const { chain } = useAppChain()
  const tokenList = useErc20Tokens()

  const { pendingSends } = usePendingSends()
  const { recentSends } = useRecentSends()

  // const { speedUpSend } = useSendToken()

  const combinedSends = useMemo(() => {
    return [...pendingSends, ...recentSends]
  }, [pendingSends, recentSends])

  const selectedSendTx = combinedSends.find(
    (send) => send.txHash === selectedSendTxHash
  )

  const token = selectedSendTx
    ? tokenList[selectedSendTx.tokenAddress.toLowerCase()]
    : undefined

  const txExplorerLink = `${chain.blockExplorers.default.url}/tx/${selectedSendTx?.txHash}`
  const statusTitle =
    selectedSendTx?.status === SEND_STATUS.success
      ? "SENT"
      : SEND_STATUS.processing
      ? "SENDING"
      : "SEND"

  // const onSpeedUpTransaction = async () => {
  //   if (!selectedSendTxHash || !token || !selectedSendTx) return
  //   await speedUpSend({
  //     txHash: selectedSendTxHash,
  //     tokenAddress: token?.address,
  //     toAddress: selectedSendTx?.to as `0x${string}`,
  //     tokenAmt: BigInt(selectedSendTx?.tokenAmt),
  //     nonce: selectedSendTx.nonce,
  //   })
  // }

  return !token || !token.symbol || !selectedSendTx ? null : (
    <div className="p-5 flex flex-col gap-[15px] flex-1  text-label-2">
      <div className="flex justify-between pb-[15px] border-b border-separator-2 text-sm">
        <div
          onClick={() => onBack()}
          className="flex items-center cursor-pointer transition-opacity opacity-70 hover:opacity-100"
        >
          <Image src="/icons/back.svg" width={17} height={17} alt="" />
          <p className="font-bold text-label-1">Activity</p>
        </div>
        <p>
          {selectedSendTx.time
            ? formatShortDate(new Date(selectedSendTx.time))
            : ""}
        </p>
      </div>

      <div className="flex justify-between items-center pb-[15px] border-b border-separator-2">
        <div className="flex flex-col gap-[4px]">
          <p className="text-xs">{statusTitle}</p>
          <div className="flex items-center gap-1">
            <Image
              className="w-5 h-5 rounded-full"
              src={formatIpfsImage(token.logoURI) || ""}
              width={20}
              height={20}
              alt=""
            />
            <h3 className="text-lg font-bold text-label-1">
              {weiToEther(Number(selectedSendTx.tokenAmt), token.decimals)}
            </h3>
          </div>
        </div>
        <div className="flex flex-col gap-[4px] items-end">
          <p className="text-xs">TO</p>
          <h3 className="text-lg font-bold text-label-1">
            {formatAddress(selectedSendTx?.to)}
          </h3>
        </div>
      </div>
      <div className="flex flex-col gap-[15px] pb-[15px] text-[15px] border-b border-separator-2">
        <div className="flex justify-between items-center">
          <p>Transaction hash</p>
          <p className="text-label-1">{formatAddress(selectedSendTx.txHash)}</p>
        </div>
        <div className="flex justify-between items-center">
          <p>Status</p>
          <div className="flex items-center gap-2">
            <p className="text-label-1 capitalize">{selectedSendTx.status}</p>
            <StatusDotIndicator status={selectedSendTx.status} />
          </div>
        </div>
      </div>
      <div className="mt-auto">
        {selectedSendTx.status === SEND_STATUS.success ? (
          <Button
            onClick={() => window.open(txExplorerLink)}
            className="w-full"
            variant="secondary"
          >
            View on explorer
          </Button>
        ) : selectedSendTx.status === SEND_STATUS.processing ? (
          <Button
            // onClick={onSpeedUpTransaction}
            className="w-full"
            variant="secondary"
          >
            Speed up transaction
          </Button>
        ) : (
          <Button
            onClick={() => populateSend(selectedSendTx)}
            className="w-full"
            variant="secondary"
          >
            Retry
          </Button>
        )}
      </div>
    </div>
  )
}

export default TransactionDetails
