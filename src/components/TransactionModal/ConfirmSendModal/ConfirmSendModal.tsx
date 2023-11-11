import Button from "@/components/Button/Button"
import GasOptionButton from "@/components/GasPriorityButton/GasPriorityButton"
import Message from "@/components/MessageTag/MessageTag"
import { GAS_OPTION_DEFAULT, GasOptionKey } from "@/constants/gas"
import { useAppChain } from "@/contexts/AppChainProvider/AppChainProvider"
import { formatAddress } from "@/utils/utils"
import Image from "next/image"
import React from "react"
import { Tooltip } from "react-tooltip"

const ConfirmSendModal = (props: {
  amount: number
  toAddress: string
  tokenURI: string
  tokenSymbol: string
  gasPriceInUsd: number
  selectedGasOption: GasOptionKey
  isNotSupported: boolean
  setSelectedGasOption: Function
  setIsOpen: (isOpen: boolean) => void
  onConfirmSend: Function
}) => {
  const {
    amount,
    tokenSymbol,
    tokenURI,
    gasPriceInUsd,
    toAddress,
    isNotSupported,
    selectedGasOption,
    setSelectedGasOption,
    setIsOpen,
    onConfirmSend,
  } = props

  const { chain } = useAppChain()

  return (
    <>
      <div className="flex justify-between pb-[20px] border-b border-separator-2">
        <h3 className="text-lg font-bold opacity-75">Confirm send</h3>
        <div
          onClick={() => setIsOpen(false)}
          className="flex items-center cursor-pointer"
        >
          <Image src="/icons/close.svg" width={28} height={28} alt="" />
        </div>
      </div>

      <div className="flex justify-between items-center pb-[20px] border-b border-separator-2">
        <div className="flex flex-col gap-2">
          <p className="text-xs opacity-50">SEND {tokenSymbol}</p>
          <div className="flex items-center gap-[8px]">
            <Image
              className="w-[25px] h-[25px] rounded-full"
              src={tokenURI || ""}
              width={25}
              height={25}
              alt=""
            />
            <h3 className="text-xl font-bold">{amount}</h3>
          </div>
        </div>

        <div className="flex flex-col gap-2 items-end">
          <p className="text-xs  opacity-50">TO</p>
          <h3 className="text-xl font-bold">{formatAddress(toAddress)}</h3>
        </div>
      </div>

      <div className="flex flex-col gap-5 pb-[15px]">
        <div className="flex justify-between items-center">
          <p className="opacity-50">Network</p>
          <div>
            <Button
              className="flex items-center rounded-[12px] gap-1 !py-2 !px-2 opacity-60"
              variant="disabled"
            >
              <Image src={chain.iconUrl} width={16} height={16} alt="" />
              <p className="text-xs font-normal text-white">{chain.name}</p>
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <p className="opacity-50">Network fee</p>
          <a
            data-tooltip-id="network-fee-tooltip"
            data-tooltip-content={`The fee paid to the Ethereum network to process your transaction. 
              It must be paid in ${chain.nativeCurrency.symbol}.
            `}
            data-tooltip-place="right"
          >
            <div className="flex items-center gap-1">
              <Image
                src={chain.nativeCurrency.logoURI}
                width={14}
                height={14}
                alt=""
              />
              <p>
                {gasPriceInUsd && !isNaN(gasPriceInUsd)
                  ? `$${gasPriceInUsd.toFixed(3)}`
                  : "--"}
              </p>
            </div>
          </a>
          <Tooltip id="network-fee-tooltip" className="!w-60 !text-xs" />
        </div>
        {/* <div className="flex justify-between items-center">
          <p className="opacity-50">Est time</p>
          <p>{"< 2mins"}</p>
        </div> */}

        <GasOptionButton
          selectedGasOption={selectedGasOption}
          setSelectedGasOption={setSelectedGasOption}
        />
      </div>

      <div className="mt-auto">
        {isNotSupported && (
          <div className="mb-2 rounded-xl ">
            <Message
              message="Sending unsupported tokens may fail due to unexpected errors"
              type="warning"
            />
          </div>
        )}
        <Button
          onClick={() => onConfirmSend()}
          className="w-full"
          variant="primary"
        >
          Confirm send
        </Button>
      </div>
    </>
  )
}

export default ConfirmSendModal
