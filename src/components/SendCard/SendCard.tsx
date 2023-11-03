import React, { useCallback, useEffect, useState } from "react"
import TokenInput from "../TokenInput/TokenInput"
import Button, { ButtonVariant } from "../Button/Button"
import TextInput from "../TextInput/TextInput"
import { useAccount } from "wagmi"
import { useChainModal, useConnectModal } from "@rainbow-me/rainbowkit"
import { isAddress } from "ethers"
import { useErc20Tokens } from "@/contexts/Erc20TokensProvider/Erc20TokensProvider"
import { useAppChain } from "@/contexts/AppChainProvider/AppChainProvider"
import { useWalletTokensBalances } from "@/contexts/Erc20TokensBalancesProvider/Erc20TokensBalancesProvider"
import { useEvmTokenPrice } from "@moralisweb3/next"
import { EvmChain } from "moralis/common-evm-utils"
import Moralis from "moralis"
import { ETH_TOKEN_ADDRESS, WETH_TOKEN_ADDRESS } from "@/constants/tokens"

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
  const { isConnected, address } = useAccount()
  const { isSupportedChainConnected } = useAppChain()
  const { openConnectModal } = useConnectModal()
  const { openChainModal } = useChainModal()
  const { chain } = useAppChain()

  const [isFetchingTokenUsdPrice, setIsFetchingTokenUsdPrice] = useState(false)
  const [selectedTokenPriceInUsd, setSelectedTokenPriceInUsd] = useState(0)

  const getTokenPrice = useCallback(
    async (tokenAddress: string) => {
      if (Moralis.Core.isStarted) {
        setIsFetchingTokenUsdPrice(true)

        //For some reason moralis returns an error for 0x0000000000000000000000000000000 address which is a token address for eth
        //So use weth address for eth
        if (tokenAddress === ETH_TOKEN_ADDRESS) {
          tokenAddress = WETH_TOKEN_ADDRESS
        }
        try {
          const response = await Moralis.EvmApi.token.getTokenPrice({
            address: tokenAddress,
            chain: chain.id,
          })

          setSelectedTokenPriceInUsd(response.toJSON().usdPrice)

          console.log(response.toJSON())
        } catch (error) {
          console.log(error)
          setSelectedTokenPriceInUsd(0)
        } finally {
          setIsFetchingTokenUsdPrice(false)
        }
      }
    },
    [chain]
  )

  useEffect(() => {
    getTokenPrice(selectedToken.address)
  }, [getTokenPrice, selectedToken.address])

  const { walletERC20Balances, isLoading: isLoadingBalance } =
    useWalletTokensBalances()
  const selectedTokenUpdatedBalance =
    walletERC20Balances[selectedToken.address.toLowerCase()]?.balance

  console.log({ walletERC20Balances, selectedToken })
  const onAmountChange = (event: any) => {
    setAmount(event.target.value)
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
    } else if (Number(amount) > Number(selectedTokenUpdatedBalance)) {
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

  console.log(Number(amount), Number(selectedTokenUpdatedBalance))

  return (
    <div className="flex-1 h-fit rounded-[16px] bg-[#1C2026] py-[35px] px-[50px] flex flex-col gap-5">
      <h5 className="font-bold text-[20px]">Send token</h5>
      <TokenInput
        selectedToken={selectedToken}
        amount={amount}
        tokenPriceInUsd={selectedTokenPriceInUsd}
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
