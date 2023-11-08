import { useAppChain } from "@/contexts/AppChainProvider/AppChainProvider"
import { useAccount, useContractRead, useFeeData, usePublicClient } from "wagmi"
import { transferABI } from "./useSendToken"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useTokenPrice } from "./useTokenPrice"
import { isAddress } from "viem"
import { ethers } from "ethers"
import { useRouter } from "next/router"

const useGasPrice = (
  tokenAddress: string,
  tokenAmt: number,
  toAddress: string,
  priority: number = 1
) => {
  const { address } = useAccount()
  const { chain } = useAppChain()
  const router = useRouter()

  const { data: feeData } = useFeeData({ cacheTime: 0, formatUnits: "ether" })
  const { estimateContractGas, estimateFeesPerGas } = usePublicClient({
    chainId: chain.id,
  })
  const {
    isLoading: isFetchingNativeTokenPrice,
    tokenPriceInUsd: nativeTokenPriceInUsd,
  } = useTokenPrice(chain.nativeCurrency.address)

  const [estimatedGas, setEstimatedGas] = useState<string>()
  const [estimatedMaxFeePerGas, setEstimatedMaxFeePerGas] = useState<string>()

  const getFees = useCallback(async () => {
    if (!isAddress(tokenAddress) || !isAddress(toAddress) || !tokenAmt) return

    const parsedTokenAmount = ethers.parseEther(tokenAmt.toString())
    try {
      const tx = {
        address: tokenAddress as `0x${string}`,
        abi: transferABI,
        functionName: "transfer",
        args: [toAddress, parsedTokenAmount],
      }

      //Gas gas details
      const estimateSendGas = await estimateContractGas({
        ...tx,
        account: address as `0x${string}`,
      })
      const { maxFeePerGas } = await estimateFeesPerGas()

      setEstimatedGas(estimateSendGas.toString())
      setEstimatedMaxFeePerGas(maxFeePerGas?.toString())
    } catch (error) {
      console.log(error)
    }
  }, [
    address,
    estimateContractGas,
    estimateFeesPerGas,
    toAddress,
    tokenAddress,
    tokenAmt,
  ])

  //Get fees on mount
  useEffect(() => {
    getFees()
  }, [getFees])

  useEffect(() => {
    //Update fees at intervals of 10secs
    const id = setInterval(() => getFees(), 10000)

    router.events.on("routeChangeStart", () => clearInterval(id))
    return () => {
      clearInterval(id)
    }
  }, [address, getFees])

  const gasPriceInUsd = useMemo(
    () =>
      Number(estimatedGas) *
      priority *
      Number(feeData?.formatted.gasPrice) *
      (nativeTokenPriceInUsd || 0),
    [estimatedGas, feeData?.formatted.gasPrice, nativeTokenPriceInUsd, priority]
  )

  return {
    estimatedGas: estimatedGas
      ? BigInt((priority * Number(estimatedGas)).toFixed())
      : undefined,
    estimatedMaxFeePerGas: estimatedMaxFeePerGas
      ? BigInt((priority * Number(estimatedMaxFeePerGas)).toFixed())
      : undefined,
    gasPriceInUsd,
  }
}

export default useGasPrice
