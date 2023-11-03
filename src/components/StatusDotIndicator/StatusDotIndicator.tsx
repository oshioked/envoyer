import { SEND_STATUS } from "@/constants/send"
import React from "react"

const StatusDotIndicator = (props: { status: string }) => {
  return (
    <div
      className={`w-[10px] h-[10px] ${
        props.status === SEND_STATUS.processing
          ? "bg-[#D6AA0D]"
          : "bg-[#0B972A]"
      } rounded-full`}
    />
  )
}

export default StatusDotIndicator
