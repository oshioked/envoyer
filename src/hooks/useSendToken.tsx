import { useAppChain } from "@/contexts/AppChainProvider/AppChainProvider"
import { useAccount } from "wagmi"
import {
  prepareSendTransaction,
  prepareWriteContract,
  sendTransaction,
  writeContract,
} from "wagmi/actions"
import useLocalStorageState from "./useLocalStorageState"

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

export const useSendToken = () => {
  const [isLoading, setIsLoading] = useLocalStorageState(
    "isSubmittingSend",
    true
  )
  const [confirmed, setConfirmed] = useLocalStorageState(
    "isSendConfirmed",
    false
  )
  const [error, setError] = useLocalStorageState("sendError", "")

  const { address } = useAccount()

  const { chain } = useAppChain()
  const nativeCurrencyAddress = chain.nativeCurrency.address

  const reset = () => {
    setIsLoading(false)
    setConfirmed(false)
    setError("")
  }

  const sendToken = async (props: {
    tokenAddress: `0x${string}`
    amount: bigint
    toAddress: `0x${string}`
    nonce?: number
    gas?: bigint
    maxFeePerGas?: bigint
    onSubmitted?: Function
    onSubmitFailed?: Function
  }) => {
    if (!address) return
    setError("")
    setConfirmed(false)
    setIsLoading(true)

    const { toAddress, tokenAddress, amount } = props

    try {
      let txHash = ""
      if (tokenAddress === nativeCurrencyAddress) {
        const nativeSendConfig = {
          from: address,
          to: toAddress,
          value: amount,
          gas: props.gas,
          maxFeePerGas: props.maxFeePerGas,
        }

        const config = await prepareSendTransaction(nativeSendConfig)
        const { hash } = await sendTransaction(config)
        txHash = hash
      } else {
        const erc20Config = {
          address: tokenAddress,
          abi: transferABI,
          functionName: "transfer",
          args: [toAddress, amount],
          gas: props.gas,
          maxFeePerGas: props.maxFeePerGas,
        }
        const config = await prepareWriteContract(erc20Config)
        const { hash } = await writeContract(config)
        txHash = hash
      }

      if (props.onSubmitted) {
        props.onSubmitted(txHash)
      }

      setConfirmed(true)
    } catch (error: any) {
      if (
        error.message.includes("ERC20: transfer amount exceeds balance") ||
        error.message.includes("exceeds the balance")
      ) {
        setError("Insufficient wallet balance")
      } else if (error.message.includes("User rejected the request")) {
        setError("User rejected the request")
      } else if (error.message.includes("block not found")) {
        setError("Block not found. Try again!")
      } else {
        setError("Failed to submit transaction")
      }
      console.log(error)
      setTimeout(() => {
        if (props.onSubmitFailed) {
          props.onSubmitFailed()
        }
      }, 3000) //Delay 3secs so user sees the message
    } finally {
      setIsLoading(false)
    }
  }

  return {
    sendToken,
    reset,
    isLoading,
    error,
    confirmed,
  }
}

export default useSendToken
