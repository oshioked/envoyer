import { SEND_STATUS } from "@/constants/send"
import React from "react"

const StatusDotIndicator = (props: { status: string }) => {
  const { status } = props
  return (
    <div
      className={`w-[10px] h-[10px] ${
        status === SEND_STATUS.processing
          ? "bg-status-yellow"
          : status === SEND_STATUS.success
          ? "bg-status-green"
          : "bg-red-500"
      } rounded-full`}
    />
  )
}

export default StatusDotIndicator
