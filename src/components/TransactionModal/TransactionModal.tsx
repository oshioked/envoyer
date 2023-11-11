import { useErc20Tokens } from "@/contexts/Erc20TokensListProvider/Erc20TokensListProvider"
import React from "react"
import Modal from "../Modal/Modal"
import ConfirmSendModal from "./ConfirmSendModal/ConfirmSendModal"
import useGasPrice from "@/hooks/useGasPrice"
import useSendToken from "@/hooks/useSendToken"
import { GAS_OPTION_DEFAULT, GasOptionKey } from "@/constants/gas"
import useLocalStorageState from "@/hooks/useLocalStorageState"
import { ProcessingModal } from "./ProcessingModal/ProcessingModal"
import { parseUnits } from "ethers"
import { useSettings } from "@/contexts/SettingsProvider/SettingsProvider"
import { usePendingSends } from "@/contexts/ActivityProvider/PendingSendsProvider/PendingSendsProvider"
import { SEND_STATUS } from "@/constants/send"
import { useAppChain } from "@/contexts/AppChainProvider/AppChainProvider"

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
  const { chain } = useAppChain()
  const { addNewPendingSend } = usePendingSends()

  const [isSendDetailsConfirmed, setIsSendDetailsConfirmed] =
    useLocalStorageState("isSendDetailsConfirmed", false)

  const tokenList = useErc20Tokens()
  const tokenDetails = tokenList[token.address.toLowerCase()]
  const {
    logoURI,
    symbol: tokenSymbol,
    hidden: tokenNotSupported,
  } = tokenDetails || {}

  const {
    gas: { selectedGasOption, setSelectedGasOption },
  } = useSettings()
  const selectedGasPriority = GAS_OPTION_DEFAULT[selectedGasOption]?.priority

  const { estimatedGas, estimatedMaxFeePerGas, gasPriceInUsd } = useGasPrice(
    token.address,
    amount,
    toAddress,
    selectedGasPriority
  )

  const [transactionHash, setTransactionHash] = useLocalStorageState<
    string | null
  >("activeSendTxHash", null)

  const {
    sendToken,
    isLoading: isSubmiting,
    error,
    confirmed,
    reset,
  } = useSendToken()

  const onConfirmClick = async () => {
    const tokenAmt = parseUnits(amount.toString(), tokenDetails.decimals)
    setTransactionHash(null) //Reset txHash to null
    setIsSendDetailsConfirmed(true)
    sendToken({
      tokenAddress: token.address as `0x${string}`,
      amount: tokenAmt,
      toAddress: toAddress as `0x${string}`,
      onSubmitted: (hash: string, nonce: number) => {
        //Add to pending transactions
        addNewPendingSend({
          txHash: hash,
          tokenAmt: tokenAmt.toString(),
          to: toAddress,
          tokenAddress: token.address,
          tokenSymbol,
          status: SEND_STATUS.processing,
          time: new Date(Date.now()).toString(),
          chainId: chain.id,
        })

        setTransactionHash(hash)

        if (resetForm) {
          resetForm()
        }
        reset()
      },
      onSubmitFailed: () => {
        setIsSendDetailsConfirmed(false)
      },
      gas: estimatedGas,
      maxFeePerGas: estimatedMaxFeePerGas,
    })
  }

  const resetConfirmedState = () => setIsSendDetailsConfirmed(false)

  return (
    <Modal
      contentClassName="w-[90%] md:w-[420px] h-fit border border-separator-1"
      isOpen={isOpen}
      setIsOpen={() => {}}
    >
      {!isSendDetailsConfirmed ? (
        <div className="p-5 flex flex-col gap-[20px] h-[502px]">
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
            isNotSupported={tokenNotSupported}
          />
        </div>
      ) : (
        <div className="p-5 flex flex-col gap-[20px] h-[302px]">
          <ProcessingModal
            isProcessing={isSubmiting}
            confirmed={confirmed}
            success={false}
            error={error}
            onClose={() => {
              setIsOpen(false)
              resetConfirmedState()
            }}
            tokenSymbol={tokenSymbol}
            tokenURI={logoURI}
            toAddress={toAddress}
            amount={amount.toString()}
            txHash={transactionHash}
          />
        </div>
      )}
    </Modal>
  )
}

export default TransactionModal
