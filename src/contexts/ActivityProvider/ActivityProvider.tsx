import React, { ReactNode } from "react"
import RecentSendsProvider from "./RecentSendsProvider/RecentSendsProvider"
import PendingSendsProvider from "./PendingSendsProvider/PendingSendsProvider"

export type SendStatus = "success" | "processing" | "failed"

export interface SendData {
  txHash: string
  tokenAmt: string
  to: string
  tokenAddress: string
  status: SendStatus
  time: string
  tokenSymbol: string
  chainId: number
}

const ActivityProvider = (props: { children: ReactNode }) => (
  <RecentSendsProvider>
    <PendingSendsProvider>{props.children}</PendingSendsProvider>
  </RecentSendsProvider>
)

export default ActivityProvider
