import Button from "@/components/Button/Button"
import { useErc20Tokens } from "@/contexts/Erc20TokensProvider/Erc20TokensProvider"
import { formatAddress } from "@/utils/utils"
import Image from "next/image"
import React, { useEffect, useState } from "react"
import Modal from "../Modal/Modal"
import ConfirmSendModal from "./ConfirmSendModal/ConfirmSendModal"
import useSendToken from "@/hooks/useSendToken"
import LoadingIndicator from "../LoadingIndicator/LoadingIndicator"

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
  const tokenList = useErc20Tokens()

  const tokenDetails = tokenList[token.address.toLowerCase()]
  const { logoURI } = tokenDetails || {}

  const { sendToken, isLoading, success, error } = useSendToken()

  return (
    <Modal
      contentClassName="w-[440px] h-[522px] border border-[#FFFFFF33]"
      isOpen={isOpen}
      setIsOpen={() => {}}
    >
      <div className="p-5 flex flex-col gap-[20px] h-full">
        {!isLoading || true ? (
          <ConfirmSendModal
            tokenURI={logoURI}
            setIsOpen={setIsOpen}
            amount={amount}
            tokenAddress={token.address}
            toAddress={toAddress}
            sendToken={sendToken}
            isLoading={isLoading}
            resetForm={resetForm}
          />
        ) : (
          //TODO - Remove whole conditional render
          <></>
          // <div className="flex flex-col justify-between items-center h-full">
          //   <div className="flex justify-between pb-[15px] w-full">
          //     <Button
          //       className="flex items-center gap-2 !py-2 !px-3 opacity-60"
          //       variant="disabled"
          //     >
          //       <Image
          //         src={"icons/tokens/eth.svg"}
          //         width={20}
          //         height={20}
          //         alt=""
          //       />
          //       <p>Arbitrum</p>
          //     </Button>
          //     <div
          //       onClick={() => props.setIsOpen(false)}
          //       className="flex items-center cursor-pointer"
          //     >
          //       <Image src="/icons/close.svg" width={28} height={28} alt="" />
          //     </div>
          //   </div>
          //   <div className="flex flex-col items-center pb-[15px] border-b w-full">
          //     <div className="flex items-center gap-[8px]">
          //       <Image
          //         className="w-[22px] h-[22px]"
          //         src={logoURI || ""}
          //         width={22}
          //         height={22}
          //         alt=""
          //       />
          //       <h3 className="text-xl font-bold">{amount || "2.1543"}</h3>
          //     </div>
          //     <div>
          //       <Image src={'/icons/back.svg'} alt={}
          //       </div>
          //     <h3 className="text-lg">{"0xfe...HYd5"}</h3>
          //   </div>
          //   <LoadingIndicator />
          //   <div>
          //     <p>Transaction is loading</p>
          //     <p>Complete in your wallet</p>
          //   </div>
          // </div>
        )}
      </div>
    </Modal>
  )
}

export default TransactionModal
