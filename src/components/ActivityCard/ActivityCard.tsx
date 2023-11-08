import React, { useEffect, useState } from "react"
import TransactionsList from "./TransactionsList/TransactionsList"
import TransactionDetails from "./TransactionDetails/TransactionDetails"
import { useAccount } from "wagmi"
import Image from "next/image"
import { useAppChain } from "@/contexts/AppChainProvider/AppChainProvider"
import { SendData } from "@/contexts/ActivityProvider/ActivityProvider"

export const ActivityCard = () => {
  const [cardState, setCardState] = useState<
    "transactions" | "transaction-details"
  >("transactions")

  const [selectedSendTxHash, setSelectedSendTxHash] = useState<string>()

  const { isConnected } = useAccount()
  const { chain } = useAppChain()

  //Whenever chain changes, switch to list view
  useEffect(() => {
    setCardState("transactions")
  }, [chain.id])

  const onTransactionClick = (txHash: string) => {
    setSelectedSendTxHash(txHash)
    setCardState("transaction-details")
  }

  return (
    <div className="w-full flex">
      {!isConnected ? (
        <div className="flex flex-col gap-2 items-center justify-center flex-1 w-full">
          <Image
            src={"/icons/connectWallet.svg"}
            alt=""
            width={80}
            height={80}
          />
          <h3 className="font-bold opacity-70">Connect wallet</h3>
          <h3 className="font-semibold text-sm opacity-50">
            Your Recent Activities
          </h3>
        </div>
      ) : cardState === "transactions" ? (
        <TransactionsList onTransactionClick={onTransactionClick} />
      ) : (
        <TransactionDetails
          selectedSendTxHash={selectedSendTxHash}
          onBack={() => setCardState("transactions")}
        />
      )}
    </div>
  )
}
