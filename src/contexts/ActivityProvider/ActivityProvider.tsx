import React, { ReactNode } from "react"
import RecentSendsProvider from "./RecentSendsProvider/RecentSendsProvider"
import PendingSendsProvider from "./PendingSendsProvider/PendingSendsProvider"

const ActivityProvider = (props: { children: ReactNode }) => (
  <RecentSendsProvider>
    <PendingSendsProvider>{props.children}</PendingSendsProvider>
  </RecentSendsProvider>
)

export default ActivityProvider
