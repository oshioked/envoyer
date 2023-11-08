import React from "react"
import TokenInput from "../TokenInput/TokenInput"
import Button, { ButtonVariant } from "../Button/Button"
import TextInput from "../TextInput/TextInput"
import { useAccount } from "wagmi"
import { useChainModal, useConnectModal } from "@rainbow-me/rainbowkit"
import { isAddress } from "ethers"
import { useAppChain } from "@/contexts/AppChainProvider/AppChainProvider"
import { useWalletTokensBalances } from "@/contexts/Erc20TokensBalancesProvider/Erc20TokensBalancesProvider"
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
    selectedToken.address
  )

  const { walletERC20Balances, isLoading: isLoadingBalance } =
    useWalletTokensBalances()
  const selectedTokenUpdatedBalance =
    walletERC20Balances[selectedToken.address.toLowerCase()]?.balance

  const onAmountChange = (value: number) => {
    if (isNaN(Number(value))) return
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
      Number(amount) > Number(selectedTokenUpdatedBalance)
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
    <div className="flex-1 h-fit rounded-[16px] bg-[#1C2026] py-[35px] px-[50px] flex flex-col gap-5">
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
            className="w-full h-[60px]"
          >
            {getButtonDetails().title}
          </Button>
        }
      </div>
    </div>
  )
}

export default SendCard
