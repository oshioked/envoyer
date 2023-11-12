import { useAppChain } from "@/contexts/AppChainProvider/AppChainProvider"
import { useMoralisInitialized } from "@/contexts/MoralisProvider/MoralisProvider"
import { getCachedData, setCacheData } from "@/utils/cacheUtils"
import { fetchTokenPrice } from "@/utils/tokens"
import Moralis from "moralis"
import React, { useCallback, useEffect, useState } from "react"

const TOKEN_PRICE_CACHE_TIME = 30 * 60000 //30mins

export const useTokenPrice = (tokenAddress: string) => {
  const { chain } = useAppChain()
  const { isInitialized: isMoralisInitialized } = useMoralisInitialized()
  const [isLoading, setIsLoading] = useState(false)
  const [tokenPriceInUsd, setTokenPriceInUsd] = useState<number>()

  const getTokenPrice = useCallback(async () => {
    //Try to get item from cache and cacheTimestamp
    const cacheKey = `${tokenAddress}.usdPrice.${chain.id}`
    const cachedPrice = getCachedData(cacheKey, TOKEN_PRICE_CACHE_TIME)
    if (cachedPrice) {
      setTokenPriceInUsd(cachedPrice)
      return cachedPrice
    }

    if (!isMoralisInitialized) return
    setIsLoading(true)
    try {
      const response = await fetchTokenPrice(tokenAddress, chain.id)
      const result = response?.toJSON().usdPrice
      setTokenPriceInUsd(result)

      //Set cache data
      setCacheData(cacheKey, result)
    } catch (error: any) {
      console.log(error)
      setTokenPriceInUsd(0)

      if (
        error.message.includes(
          "No pools found with enough liquidity, to calculate the price"
        )
      ) {
        setCacheData(cacheKey, "0.00")
      }
    } finally {
      setIsLoading(false)
    }
  }, [tokenAddress, chain.id, isMoralisInitialized])

  useEffect(() => {
    getTokenPrice()
  }, [getTokenPrice])

  return {
    isLoading,
    tokenPriceInUsd,
  }
}
