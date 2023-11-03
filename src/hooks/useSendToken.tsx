import { SEND_STATUS } from "@/constants/send"
import { usePendingSends } from "@/contexts/ActivityProvider/PendingSendsProvider/PendingSendsProvider"
import { ethers } from "ethers"
import React, { useState } from "react"
import { writeContract } from "wagmi/actions"

const transferABI = [
  {
    name: "transfer",
    type: "function",
    inputs: [
      {
        name: "_to",
        type: "address",
      },
      {
        type: "uint256",
        name: "_tokens",
      },
    ],
    constant: false,
    outputs: [],
    payable: false,
  },
]

export const useSendToken = (props: { onSuccess?: Function } = {}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [success, setSuccess] = useState<boolean | null>(null)
  const [error, setError] = useState("")

  const { addNewPendingSend } = usePendingSends()

  const sendToken = async (
    tokenAddress: `0x${string}`,
    amount: string,
    to: `0x${string}`
  ) => {
    setError("")
    setConfirmed(false)
    setSuccess(null)
    setIsLoading(true)

    try {
      const tokenAmt = ethers.parseUnits(amount)

      let hash
      const { hash: txHash } = await writeContract({
        address: tokenAddress,
        abi: transferABI,
        functionName: "transfer",
        args: [to, tokenAmt],
      })
      hash = txHash

      setConfirmed(true)

      //Add to pending transactions
      const { data, success, error } = await addNewPendingSend({
        txHash: hash,
        tokenAmt: tokenAmt.toString(),
        to,
        tokenAddress,
        status: SEND_STATUS.processing,
        time: new Date(Date.now()).toString(),
      })

      if (success) {
        console.log({ data }, "Transaction complete")
        if (props.onSuccess) {
          props.onSuccess()
        }
        setSuccess(true)
      } else {
        throw new Error("Transaction did not succeed")
      }
    } catch (error: any) {
      console.log(
        error
        // error.toString()
      )

      //TODO - Give clear error messages
      if (error.message.includes("ERC20: transfer amount exceeds balance")) {
        setError("Insufficient wallet balance")
      } else if (error.message.includes("User rejected the request")) {
        setError("User rejected the request")
      } else {
        setError("Failed to send tokens")
        console.log(error, "Error sending tokens")
      }
    } finally {
      setTimeout(() => {
        setIsLoading(false)
      }, 3000)
    }
  }

  return {
    sendToken,
    isLoading,
    success,
    error,
    confirmed,
  }
}

export default useSendToken
