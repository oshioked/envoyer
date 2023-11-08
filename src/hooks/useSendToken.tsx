import { SEND_STATUS } from "@/constants/send"
import { usePendingSends } from "@/contexts/ActivityProvider/PendingSendsProvider/PendingSendsProvider"
import { useAppChain } from "@/contexts/AppChainProvider/AppChainProvider"
import { useState } from "react"
import { isHash, isAddress } from "viem"
import {
  fetchTransaction,
  waitForTransaction,
  writeContract,
} from "wagmi/actions"

export const transferABI = [
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

export const useSendToken = (
  props: {
    onSubmitted?: Function
    onSubmitFailed?: Function
    gas?: bigint
    maxFeePerGas?: bigint
  } = {}
) => {
  const [isLoading, setIsLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [success, setSuccess] = useState<boolean | null>(null)
  const [error, setError] = useState("")

  const { chain } = useAppChain()

  const reset = () => {
    setIsLoading(false)
    setConfirmed(false)
    setSuccess(null)
    setError("")
  }
  const { addNewPendingSend } = usePendingSends()

  const sendToken = async (
    tokenAddress: `0x${string}`,
    amount: bigint,
    to: `0x${string}`,
    tokenSymbol: string,
    nonce?: number
  ) => {
    setError("")
    setConfirmed(false)
    setSuccess(null)
    setIsLoading(true)

    console.log("Send token called")

    try {
      const { hash } = await writeContract({
        address: tokenAddress,
        abi: transferABI,
        functionName: "transfer",
        args: [to, amount],
        gas: props.gas,
        maxFeePerGas: props.maxFeePerGas,
        nonce,
      })

      if (props.onSubmitted) {
        console.log("calling on submitted")
        props.onSubmitted()
      }

      //Add to pending transactions
      addNewPendingSend({
        txHash: hash,
        tokenAmt: amount.toString(),
        to,
        tokenAddress,
        tokenSymbol,
        status: SEND_STATUS.processing,
        time: new Date(Date.now()).toString(),
        chainId: chain.id,
      })

      setConfirmed(true)
      console.log("Just set confirmed")
    } catch (error: any) {
      console.log(error)
      //TODO - Give clear error messages
      if (error.message.includes("ERC20: transfer amount exceeds balance")) {
        setError("Insufficient wallet balance")
      } else if (error.message.includes("User rejected the request")) {
        setError("User rejected the request")
      } else if (error.message.includes("block not found")) {
        setError("Block not found. Try again!")
      } else {
        setError("Failed to submit transaction")
        console.log(error, "Error sending tokens")
      }
      setTimeout(() => {
        if (props.onSubmitFailed) {
          props.onSubmitFailed()
        }
      }, 2000) //Delay 3secs so user sees the message
    } finally {
      setIsLoading(false)
    }
  }

  console.log({ confirmed, success })

  const speedUpSend = async (
    txHash: string,
    tokenAddress: string,
    toAddress: string,
    tokenAmt: string,
    speedUpRate: number = 1.15
  ) => {
    if (!isHash(txHash) || !isAddress(tokenAddress)) {
      return
    }
    try {
      //Check transaction status and get nonce
      const { nonce, gas, maxFeePerGas, ...rest } = await fetchTransaction({
        hash: txHash,
      })

      console.log({ nonce, gas, maxFeePerGas, ...rest })
      //send new transaction again with the same nonce and higher maxFeePerGas
      const { hash } = await writeContract({
        address: tokenAddress,
        abi: transferABI,
        functionName: "transfer",
        args: [toAddress, tokenAmt],
        gas: gas,
        maxFeePerGas: BigInt(Number(maxFeePerGas) * speedUpRate),
        nonce,
      })

      const txDetails = await waitForTransaction({ hash })
    } catch (error) {}
  }
  return {
    sendToken,
    speedUpSend,
    reset,
    isLoading,
    success,
    error,
    confirmed,
  }
}

export default useSendToken
