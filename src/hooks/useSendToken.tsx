import { useAppChain } from "@/contexts/AppChainProvider/AppChainProvider"
import { isHash, isAddress } from "viem"
import { useAccount } from "wagmi"
import {
  fetchTransaction,
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

  const speedUpSend = async (props: {
    txHash: string
    tokenAddress: string
    toAddress: `0x${string}`
    tokenAmt: bigint
    speedUpRate?: number
    nonce?: number
  }) => {
    const {
      txHash,
      tokenAddress,
      toAddress,
      tokenAmt,
      speedUpRate = 1.15,
    } = props
    if (!isHash(txHash) || !isAddress(tokenAddress)) {
      return
    }

    try {
      let txNonce = props.nonce
      if (!txNonce) {
        //Check transaction status and get nonce
        const { nonce: fetchedNonce } = await fetchTransaction({
          hash: txHash,
        })
        txNonce = fetchedNonce
      }

      //send new transaction again with the same nonce and higher maxFeePerGas
      await sendToken({
        tokenAddress,
        amount: tokenAmt,
        toAddress,
        nonce: txNonce,
        // gas: BigInt(Math.ceil(Number(gas) * speedUpRate)), //TODO - Pass in the latest gas fees as prop;
        // maxFeePerGas: BigInt(Math.ceil(Number(maxFeePerGas) * speedUpRate)),
        onSubmitted: () => {},
      })

      // Replace transaction in pending task Array
    } catch (error) {
      console.log(error)
    }
  }
  return {
    sendToken,
    speedUpSend,
    reset,
    isLoading,
    error,
    confirmed,
  }
}

export default useSendToken
