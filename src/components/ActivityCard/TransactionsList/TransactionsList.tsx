import { useErc20Tokens } from "@/contexts/Erc20TokensListProvider/Erc20TokensListProvider"
import { usePendingSends } from "@/contexts/ActivityProvider/PendingSendsProvider/PendingSendsProvider"
import { useRecentSends } from "@/contexts/ActivityProvider/RecentSendsProvider/RecentSendsProvider"
import React, { useMemo } from "react"
import TransactionRow, {
  TransactionRowLoading,
} from "./TransactionRow/TransactionRow"
import { SendData } from "@/contexts/ActivityProvider/ActivityProvider"
const TransactionsList = (props: {
  onTransactionClick: (txHash: string) => void
}) => {
  const tokenList = useErc20Tokens()
  const { pendingSends } = usePendingSends()
  const { recentSends, isLoading: isLoadingRecentSends } = useRecentSends()

  const combinedSends = useMemo(() => {
    // Remove duplicate tokens based on their addresses and chains
    const uniqueSends = [...pendingSends, ...recentSends].reduce(
      (result, send) => {
        const isDuplicate = result.find(
          (s: SendData) =>
            s.txHash === send.txHash && s.chainId === send.chainId
        )
        if (!isDuplicate) {
          result.push(send)
        }
        return result
      },
      [] as SendData[]
    )

    //Sort them with time
    const sortedSends = uniqueSends.sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
    )
    return sortedSends
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
