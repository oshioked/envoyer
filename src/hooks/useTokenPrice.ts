import {
  NATIVE_TOKEN_ADDRESS,
  WRAPPED_NATIVE_TOKEN_ADDRESSES,
} from "@/constants/tokens"
import { useAppChain } from "@/contexts/AppChainProvider/AppChainProvider"
import Moralis from "moralis"
import React, { useCallback, useEffect, useState } from "react"

export const useTokenPrice = (tokenAddress: string) => {
  const { chain } = useAppChain()
  const [isLoading, setIsLoading] = useState(false)
  const [tokenPriceInUsd, setTokenPriceInUsd] = useState(0)

  const getTokenPrice = useCallback(async () => {
    if (Moralis.Core.isStarted) {
      setIsLoading(true)
      let fetchAddress = tokenAddress
      console.log({ fetchAddress })

      //For some reason moralis returns an error for ETH address
      // So check for that and use WETH instead
      if (Object.values(NATIVE_TOKEN_ADDRESS).includes(tokenAddress)) {
        fetchAddress = WRAPPED_NATIVE_TOKEN_ADDRESSES[chain.id]
      }
      try {
        const response = await Moralis.EvmApi.token.getTokenPrice({
          address: fetchAddress,
          chain: chain.id,
        })

        setTokenPriceInUsd(response.toJSON().usdPrice)

        console.log(response.toJSON())
      } catch (error) {
        console.log(error)
        setTokenPriceInUsd(0)
      } finally {
        setIsLoading(false)
      }
    }
  }, [chain, tokenAddress])

  useEffect(() => {
    getTokenPrice()
  }, [getTokenPrice])

  return {
    isLoading,
    tokenPriceInUsd,
  }
}
