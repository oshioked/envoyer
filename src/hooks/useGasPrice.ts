import { useAppChain } from "@/contexts/AppChainProvider/AppChainProvider"
import { useAccount, usePublicClient } from "wagmi"
import { transferABI } from "./useSendToken"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useTokenPrice } from "./useTokenPrice"
import { isAddress } from "viem"
import { ethers } from "ethers"
import { useRouter } from "next/router"
import { fetchFeeData } from "wagmi/actions"
import { useWalletTokensBalances } from "@/contexts/TokensBalancesProvider/TokensBalancesProvider"

const useGasPrice = (
  tokenAddress: string,
  tokenAmt: number,
  toAddress: string,
  priority: number = 1
) => {
  const { address } = useAccount()
  const { chain } = useAppChain()
  const router = useRouter()
  const { estimateContractGas } = usePublicClient({
    chainId: chain.id,
  })

  const [estimatedGas, setEstimatedGas] = useState<string>()
  const [estimatedMaxFeePerGas, setEstimatedMaxFeePerGas] = useState<string>()
  const [gasPrice, setGasPrice] = useState<string>()

  const {
    isLoading: isFetchingNativeTokenPrice,
    tokenPriceInUsd: nativeTokenPriceInUsd,
  } = useTokenPrice(chain.nativeCurrency.address)

  const { walletTokensBalances } = useWalletTokensBalances()
  const tokenBalance = walletTokensBalances[tokenAddress.toLowerCase()]?.balance

  const getFees = useCallback(async () => {
    if (
      !isAddress(tokenAddress) ||
      !isAddress(toAddress) ||
      !tokenAmt ||
      !tokenBalance ||
      Number(tokenBalance) < tokenAmt
    )
      return

    const parsedTokenAmount = ethers.parseEther(tokenAmt.toString())
    try {
      const tx = {
        address: tokenAddress as `0x${string}`,
        abi: transferABI,
        functionName: "transfer",
        args: [toAddress, parsedTokenAmount],
      }

      //Get gas required to send tx
      const estimateSendGas = await estimateContractGas({
        ...tx,
        account: address as `0x${string}`,
      })

      //Get fees
      const {
        maxFeePerGas,
        formatted: { gasPrice },
      } = await fetchFeeData({
        formatUnits: "ether",
      })

      setEstimatedGas(estimateSendGas.toString())
      setEstimatedMaxFeePerGas(maxFeePerGas?.toString())
      setGasPrice(gasPrice?.toString())
    } catch (error) {
      setEstimatedGas("")
      console.log(error)
    }
  }, [
    address,
    estimateContractGas,
    toAddress,
    tokenAddress,
    tokenAmt,
    tokenBalance,
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
      Number(gasPrice) *
      (nativeTokenPriceInUsd || 0),
    [estimatedGas, gasPrice, nativeTokenPriceInUsd, priority]
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
