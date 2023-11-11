import React from "react"
import TokenInput from "../TokenInput/TokenInput"
import Button, { ButtonVariant } from "../Button/Button"
import TextInput from "../TextInput/TextInput"
import { useAccount } from "wagmi"
import { useChainModal, useConnectModal } from "@rainbow-me/rainbowkit"
import { isAddress } from "ethers"
import { useAppChain } from "@/contexts/AppChainProvider/AppChainProvider"
import { useWalletTokensBalances } from "@/contexts/TokensBalancesProvider/TokensBalancesProvider"
import { useTokenPrice } from "@/hooks/useTokenPrice"

interface SendCardProps {
  selectedToken: any
  setIsTokensModalOpen: (isOpen: boolean) => void
  recipientAddress: string
  setRecipientAddress: (address: string) => void
  amount: number
  setAmount: (amount: number) => void
  openConfirmSendModal: () => void
}

export const SendCard = (props: SendCardProps) => {
  const {
    selectedToken,
    setIsTokensModalOpen,
    recipientAddress,
    setRecipientAddress,
    amount,
    setAmount,
    openConfirmSendModal,
  } = props
  const { isConnected } = useAccount()
  const { isSupportedChainConnected } = useAppChain()
  const { openConnectModal } = useConnectModal()
  const { openChainModal } = useChainModal()
  const { isLoading: isFetchingTokenUsdPrice, tokenPriceInUsd } = useTokenPrice(
    selectedToken?.address
  )

  const { walletTokensBalances, isLoading: isLoadingBalance } =
    useWalletTokensBalances()
  const selectedTokenUpdatedBalance =
    walletTokensBalances[selectedToken.address.toLowerCase()]?.balance

  const onAmountChange = (value: number) => {
    if (isNaN(Number(value)) || value < 0) return
    setAmount(value)
  }

  const onRecipientAddressChange = (event: any) => {
    setRecipientAddress(event.target.value)
  }

  const getButtonDetails = () => {
    if (!isConnected) {
      return {
        title: "Connect wallet",
        onClick: openConnectModal,
        variant: "secondary",
      }
    } else if (!isSupportedChainConnected) {
      return {
        title: "Connect to a supported network",
        onClick: openChainModal,
        variant: "secondary",
      }
    } else if (isLoadingBalance) {
      return {
        title: "Fetching your details",
        variant: "disabled",
      }
    } else if (!amount || !(Number(amount) > 0)) {
      return {
        title: "Enter an amount",
        variant: "disabled",
        onClick: () => null,
      }
    } else if (
      !selectedTokenUpdatedBalance ||
      Number(amount) > Number(selectedTokenUpdatedBalance) * 0.97 //TODO -Put this in a variable Can't send all your tokens
    ) {
      return {
        title: `Insufficient ${selectedToken.symbol} balance`,
        variant: "disabled",
        onClick: () => null,
      }
    } else if (!isAddress(recipientAddress)) {
      return {
        title: `Enter valid recipient address`,
        variant: "disabled",
        onClick: () => null,
      }
    } else {
      return {
        title: "Send Token",
        variant: "primary",
        onClick: openConfirmSendModal,
      }
    }
  }

  return (
    <div className="w-full h-fit rounded-[16px] bg-background-secondary flex flex-col gap-5 p-4 md:py-[35px] md:px-[5%] ">
      <h5 className="font-bold text-[20px]">Send token</h5>
      <TokenInput
        selectedToken={selectedToken}
        amount={amount}
        tokenPriceInUsd={tokenPriceInUsd}
        isLoadingTokenPrice={isFetchingTokenUsdPrice}
        onAmountChange={onAmountChange}
        setIsTokensModalOpen={setIsTokensModalOpen}
        isLoadingBalance={isLoadingBalance}
      />
      <TextInput
        value={recipientAddress}
        onChange={onRecipientAddressChange}
        aria-label="Recipient address"
      />
      <div className="mt-3">
        {
          <Button
            onClick={getButtonDetails().onClick}
            variant={getButtonDetails().variant as ButtonVariant}
            className="w-full md:h-[65px]"
          >
            {getButtonDetails().title}
          </Button>
        }
      </div>
    </div>
  )
}

export default SendCard
