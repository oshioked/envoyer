import React from "react"
import Button from "../Button/Button"
import Image from "next/image"
import { useErc20Tokens } from "@/contexts/Erc20TokensListProvider/Erc20TokensListProvider"
import { formatIpfsImage } from "@/utils/utils"
import Skeleton from "react-loading-skeleton"
import { useAccount } from "wagmi"

interface TokenInputProps {
  isLoadingBalance: boolean
  selectedToken: any
  amount: number
  tokenPriceInUsd?: number
  isLoadingTokenPrice?: boolean
  setIsTokensModalOpen: (isOpen: boolean) => void
  onAmountChange: (amount: number) => void
}

const TokenInput = (props: TokenInputProps) => {
  const {
    selectedToken,
    setIsTokensModalOpen,
    onAmountChange,
    amount,
    isLoadingTokenPrice,
    tokenPriceInUsd,
    isLoadingBalance,
  } = props

  const { isConnected } = useAccount()

  const { tokens } = useErc20Tokens()
  const selectedTokenUpdatedBalance =
    tokens[selectedToken.address.toLowerCase()]?.balance

  return (
    <div className="bg-background-primary pt-4 pb-[27px] px-6 gap-4 rounded-[15px] flex justify-between h-[130px]">
      <div className="flex flex-col gap-1 flex-1 ">
        <label>Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(event: any) => onAmountChange(event.target.value)}
          className="bg-transparent text-4xl w-full outline-none"
          placeholder="0"
        />
        {isLoadingTokenPrice ? (
          <span className="w-12 h-5">
            <Skeleton className="w-10" />
          </span>
        ) : tokenPriceInUsd && Boolean(tokenPriceInUsd) ? (
          <p className="text-sm opacity-30">
            ≈${(amount * tokenPriceInUsd).toFixed(2)}
          </p>
        ) : null}
      </div>
      <div className="flex flex-col justify-between gap-2 w-fit">
        <Button
          variant="tertiary"
          className="flex items-center gap-2 !py-[8px] !px-[10px]"
          onClick={() => setIsTokensModalOpen(true)}
        >
          <Image
            className="rounded-full"
            src={formatIpfsImage(selectedToken?.logoURI)}
            width={20}
            height={20}
            alt=""
          />
          <p className="text-[15px]">{selectedToken?.symbol}</p>
          <Image
            loading="eager"
            src={"/icons/chevDown.svg"}
            width={13}
            height={13}
            alt=""
          />
        </Button>
        {isConnected && (
          <div className="flex flex-col items-end">
            <p className="text-xs text-label-3">Bal:</p>
            <div
              onClick={() =>
                !isLoadingBalance && selectedTokenUpdatedBalance
                  ? onAmountChange(Number(selectedTokenUpdatedBalance))
                  : null
              }
              className="flex gap-1 justify-end cursor-pointer"
            >
              <Image src={"/icons/wallet.svg"} width={20} height={20} alt="" />
              {isLoadingBalance ? (
                <div className="h-13 w-[50px]">
                  <Skeleton />
                </div>
              ) : (
                <p className="text-sm opacity-70">
                  {selectedTokenUpdatedBalance
                    ? Number(selectedTokenUpdatedBalance).toFixed(3)
                    : 0}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TokenInput
