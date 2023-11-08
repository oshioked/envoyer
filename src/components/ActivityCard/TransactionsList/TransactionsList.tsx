import { useErc20Tokens } from "@/contexts/Erc20TokensProvider/Erc20TokensProvider"
import { usePendingSends } from "@/contexts/ActivityProvider/PendingSendsProvider/PendingSendsProvider"
import { useRecentSends } from "@/contexts/ActivityProvider/RecentSendsProvider/RecentSendsProvider"
import React, { useMemo } from "react"
import TransactionRow, {
  TransactionRowLoading,
} from "./TransactionRow/TransactionRow"
const TransactionsList = (props: {
  onTransactionClick: (txHash: string) => void
}) => {
  const tokenList = useErc20Tokens()
  const { pendingSends } = usePendingSends()
  const { recentSends, isLoading: isLoadingRecentSends } = useRecentSends()

  const combinedSends = useMemo(() => {
    return [...pendingSends, ...recentSends]
  }, [pendingSends, recentSends])

  return (
    <div className="flex flex-col flex-1 overflow-y-scroll">
      {isLoadingRecentSends ? (
        [1, 2, 3, 4, 5].map((a, i) => (
          <TransactionRowLoading key={i} listIndex={i} />
        ))
      ) : !combinedSends.length ? (
        <div className="flex justify-center items-center h-full">
          No recent activities
        </div>
      ) : (
        <>
          {combinedSends.map((send, i) => {
            const token = tokenList
              ? tokenList[send.tokenAddress.toLowerCase()]
              : ({} as Token)
            return (
              <TransactionRow
                key={send.txHash}
                onTransactionClick={props.onTransactionClick}
                send={send}
                token={token}
                status={send.status}
                listIndex={i}
              />
            )
          })}
        </>
      )}
    </div>
  )
}

export default TransactionsList
