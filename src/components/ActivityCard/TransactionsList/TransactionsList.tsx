import { useErc20Tokens } from "@/contexts/Erc20TokensProvider/Erc20TokensProvider"
import {
  PendingSend,
  usePendingSends,
} from "@/contexts/ActivityProvider/PendingSendsProvider/PendingSendsProvider"
import {
  RecentSend,
  useRecentSends,
} from "@/contexts/ActivityProvider/RecentSendsProvider/RecentSendsProvider"
import { formatAddress, weiToEther } from "@/utils/utils"
import Image from "next/image"
import React from "react"
import { useAccount } from "wagmi"
import TransactionRow, {
  TransactionRowLoading,
} from "./TransactionRow/TransactionRow"

const TransactionsList = (props: {
  onTransactionClick: (tx: PendingSend | RecentSend) => void
}) => {
  const tokenList = useErc20Tokens()
  const { pendingSends } = usePendingSends()
  const { recentSends, isLoading: isLoadingRecentSends } = useRecentSends()

  return (
    <div className="flex flex-col flex-1 overflow-y-scroll">
      {isLoadingRecentSends ? (
        <>
          <TransactionRowLoading listIndex={0} />
          <TransactionRowLoading listIndex={1} />
          <TransactionRowLoading listIndex={2} />
          <TransactionRowLoading listIndex={3} />
          <TransactionRowLoading listIndex={4} />
        </>
      ) : !Object.values({ ...pendingSends, ...recentSends }).length ? (
        <div className="flex justify-center items-center h-full">
          No recent activities
        </div>
      ) : (
        <>
          {Object.values(pendingSends).map((send, i) => {
            const token = tokenList
              ? tokenList[send.tokenAddress.toLowerCase()]
              : {}
            return (
              <TransactionRow
                key={send.txHash}
                onTransactionClick={props.onTransactionClick}
                send={send}
                token={token}
                status="processing"
                listIndex={i}
              />
            )
          })}
          {recentSends.map((send, i) => {
            const token = tokenList
              ? tokenList[send.tokenAddress.toLowerCase()]
              : {}
            return (
              <TransactionRow
                key={send.txHash}
                onTransactionClick={props.onTransactionClick}
                send={send}
                token={token}
                status="success"
                listIndex={i + Object.values(pendingSends).length}
              />
            )
          })}
        </>
      )}
    </div>
  )
}

export default TransactionsList
