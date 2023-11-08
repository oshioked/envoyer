import {
  NATIVE_TOKEN_ADDRESS,
  WRAPPED_NATIVE_TOKEN_ADDRESSES,
} from "@/constants/tokens"
import { useAppChain } from "@/contexts/AppChainProvider/AppChainProvider"
import { getCachedData, setCacheData } from "@/utils/cacheUtils"
import Moralis from "moralis"
import React, { useCallback, useEffect, useState } from "react"

//TODO - Confirm this works and if yes, move to helpers folder
const fetchTokenPrice = async (tokenAddress: string, chainId: number) => {
  if (!Moralis.Core.isStarted) return
  let fetchAddress = tokenAddress

  //For some reason moralis returns an error for some native address
  // So check for that and use Wrapped token instead
  if (Object.values(NATIVE_TOKEN_ADDRESS).includes(tokenAddress)) {
    fetchAddress = WRAPPED_NATIVE_TOKEN_ADDRESSES[chainId]
  }
  const response = await Moralis.EvmApi.token.getTokenPrice({
    address: fetchAddress,
    chain: chainId,
  })
  return response
}

const TOKEN_PRICE_CACHE_TIME = 360_000 //TODO experiment with this

export const useTokenPrice = (tokenAddress: string) => {
  const { chain } = useAppChain()
  const [isLoading, setIsLoading] = useState(false)
  const [tokenPriceInUsd, setTokenPriceInUsd] = useState<number>()

  const getTokenPrice = useCallback(async () => {
    //Try to get item from cache and cacheTimestamp
    const cacheKey = `${tokenAddress}.usdPrice.${chain.id}`
    const cachedPrice = getCachedData(cacheKey, TOKEN_PRICE_CACHE_TIME)
    if (cachedPrice) return cachedPrice

    if (!Moralis.Core.isStarted) return
    setIsLoading(true)
    try {
      const response = await fetchTokenPrice(tokenAddress, chain.id)
      const result = response?.toJSON().usdPrice
      setTokenPriceInUsd(result)

      //Set cache data
      setCacheData(cacheKey, result)
    } catch (error) {
      console.log(error)
      setTokenPriceInUsd(0)
    } finally {
      setIsLoading(false)
    }
  }, [tokenAddress, chain.id])

  useEffect(() => {
    getTokenPrice()
  }, [getTokenPrice])

  return {
    isLoading,
    tokenPriceInUsd,
  }
}
