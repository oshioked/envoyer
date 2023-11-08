import { useErc20Tokens } from "@/contexts/Erc20TokensProvider/Erc20TokensProvider"
import React from "react"
import Modal from "../Modal/Modal"
import ConfirmSendModal from "./ConfirmSendModal/ConfirmSendModal"
import useGasPrice from "@/hooks/useGasPrice"
import useSendToken from "@/hooks/useSendToken"
import { GAS_OPTION_DEFAULT, GasOptionKey } from "@/constants/gas"
import useLocalStorageState from "@/hooks/useLocalStorageState"
import { ProcessingModal } from "./ProcessingModal/ProcessingModal"
import { parseUnits } from "ethers"
import { useWalletTokensBalances } from "@/contexts/Erc20TokensBalancesProvider/Erc20TokensBalancesProvider"

const TransactionModal = (props: {
  sendDetails: {
    toAddress: string
    amount: number
    token: Token
  }
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  resetForm: Function
}) => {
  const { sendDetails, isOpen, setIsOpen, resetForm } = props
  const { toAddress, amount, token } = sendDetails

  const [isSendDetailsConfirmed, sendIsSendDetailsConfirmed] =
    useLocalStorageState("isSendDetailsConfirmed", false)

  const tokenList = useErc20Tokens()
  const tokenDetails = tokenList[token.address.toLowerCase()]
  const { logoURI, symbol: tokenSymbol } = tokenDetails || {}

  const [selectedGasOption, setSelectedGasOption] =
    useLocalStorageState<GasOptionKey>("selectedGasOption", "low")
  const selectedGasPriority = GAS_OPTION_DEFAULT[selectedGasOption]?.priority

  const { estimatedGas, estimatedMaxFeePerGas, gasPriceInUsd } = useGasPrice(
    token.address,
    amount,
    toAddress,
    selectedGasPriority
  )

  const {
    sendToken,
    isLoading: isSubmiting,
    success,
    error,
    confirmed,
    reset,
  } = useSendToken({
    onSubmitted: () => {
      if (resetForm) {
        resetForm()
      }
      reset()
    },
    onSubmitFailed: () => {
      sendIsSendDetailsConfirmed(false)
    },

    gas: estimatedGas,
    maxFeePerGas: estimatedMaxFeePerGas,
  })

  const onConfirmClick = async () => {
    sendIsSendDetailsConfirmed(true)
    sendToken(
      token.address as `0x${string}`,
      parseUnits(amount.toString(), tokenDetails.decimals),
      toAddress as `0x${string}`,
      tokenSymbol
    )
  }

  const resetConfirmedState = () => sendIsSendDetailsConfirmed(false)

  return (
    <Modal
      contentClassName="w-fit h-fit border border-[#FFFFFF33]"
      isOpen={isOpen}
      setIsOpen={() => {}}
    >
      {!isSendDetailsConfirmed ? (
        <div className="p-5 flex flex-col gap-[20px] w-[420px] h-[502px]">
          <ConfirmSendModal
            tokenURI={logoURI}
            tokenSymbol={tokenSymbol}
            setIsOpen={setIsOpen}
            amount={amount}
            toAddress={toAddress}
            onConfirmSend={onConfirmClick}
            gasPriceInUsd={gasPriceInUsd}
            selectedGasOption={selectedGasOption}
            setSelectedGasOption={setSelectedGasOption}
          />
        </div>
      ) : (
        <div className="p-5 flex flex-col gap-[20px] w-[420px] h-[302px]">
          <ProcessingModal
            isProcessing={isSubmiting}
            confirmed={confirmed}
            success={Boolean(success)}
            error={error}
            onClose={() => {
              setIsOpen(false)
              resetConfirmedState()
            }}
            tokenSymbol={tokenSymbol}
            tokenURI={logoURI}
            toAddress={toAddress}
            amount={amount.toString()}
          />
        </div>
      )}
    </Modal>
  )
}

export default TransactionModal
