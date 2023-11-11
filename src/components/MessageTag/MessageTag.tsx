import React, { useState } from "react"

const Message = (props: { message: string; type: "warning" | "message" }) => {
  const { message, type } = props

  const typeClassNames = {
    warning: "bg-background-errorForeground text-red-500",
    message: "bg-background-primary text-accent-primary opacity-60",
  }

  return closed ? null : (
    <div
      className={`${
        typeClassNames[type] || ""
      } text-sm p-3 rounded-xl shadow-md`}
    >
      {message}
    </div>
  )
}

export default Message
