import { SUPPORTED_CHAIN } from "@/constants/chains"
import {
  NATIVE_TOKEN_ADDRESS,
  WRAPPED_NATIVE_TOKEN_ADDRESSES,
  backupTokenLists,
  mainTokenList,
} from "@/constants/tokens"
import { TokenBalances } from "@/contexts/TokensBalancesProvider/TokensBalancesProvider"
import Moralis from "moralis"

export const weiToEther = (
  weiAmount: number,
  decimal: number = 18,
  dp: number = 4
) => {
  if (!weiAmount) return "0"
  const divider = 10 ** decimal
  const etherAmount = Number(weiAmount / divider)

  return etherAmount.toFixed(dp)
}

export const fetchTokenPrice = async (
  tokenAddress: string,
  chainId: number
) => {
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

export const fetchTokenListFromUrls = async () => {
  const allTokens = []

  // Fetch token lists from multiple URLs
  for (const url of mainTokenList) {
    try {
      const response = await fetch(url)
      const result = await response.json()
      const tokenList = result.tokens

      allTokens.push(...tokenList) //Spread all result tokens in allTokens
    } catch (error) {
      console.error(`Error fetching token list from ${url}: ${error}`)
    }
  }

  //If after fetching from main token list and allTokens is empty. Say if it returns error
  //Fetch from backup list
  if (!allTokens.length) {
    for (const url of backupTokenLists) {
      try {
        const response = await fetch(url)
        const result = await response.json()
        const tokenList = result.tokens

        allTokens.push(...tokenList) //Spread all result tokens in allTokens
      } catch (error) {
        console.error(`Error fetching token list from ${url}: ${error}`)
      }
    }
  }

  // Remove duplicate tokens based on their addresses and chains
  const uniqueTokens = allTokens.reduce((result, token) => {
    const isDuplicate = result.find(
      (t: any) => t.address === token.address && t.chainId === token.chainId
    )
    if (!isDuplicate) {
      result.push(token)
    }
    return result
  }, [])

  // Group tokens by chainId
  const groupedTokens = uniqueTokens.reduce((result: any, token: any) => {
    const { chainId, address } = token

    if (!result[chainId]) {
      result[chainId] = {}
    }

    result[chainId][address.toLowerCase()] = token

    return result
  }, {})

  return groupedTokens
}

//Combines wallet tokens and fetched tokens
// The result is in this order: native token, supported wallet tokens, unsupported wallet tokesn and rest tokens
export const combinedWalletBalancesAndTokenList = ({
  chainTokens,
  walletTokensBalances,
  chainId,
}: {
  chainTokens: { [tokenAddress: string]: Token }
  walletTokensBalances: TokenBalances
  chainId: number
}) => {
  if (!chainTokens || !walletTokensBalances) return

  const supportedWalletTokensResult: { [address: string]: Token } = {}
  const unsupportedWalletTokens: { [address: string]: Token } = {}
  const updatedTokenList = { ...chainTokens }

  //Add the native token to display list first
  const nativeToken = SUPPORTED_CHAIN[chainId].nativeCurrency
  if (nativeToken) {
    supportedWalletTokensResult[nativeToken?.address.toLowerCase()] = {
      ...nativeToken,
      chainId: chainId,
      balance: walletTokensBalances[nativeToken.address]?.balance || "",
    }
  }
  //Remove native token from rest fetched tokens
  delete updatedTokenList[nativeToken.address]

  //Loop through wallet tokens and push to supportedWalletTokensResult or unsupportedWalletTokens
  for (let i = 0; i < Object.keys(walletTokensBalances).length; i++) {
    const walletToken = Object.values(walletTokensBalances)[i]
    const tokenAddress = walletToken.tokenAddress.toLowerCase()
    if (tokenAddress !== nativeToken.address) {
      if (chainTokens[tokenAddress]) {
        //Add to combined token list
        supportedWalletTokensResult[tokenAddress] = {
          ...chainTokens[tokenAddress],
          balance: walletToken.balance,
        }

        //Remove from fetched tokens list
        delete updatedTokenList[tokenAddress]
      } else {
        //If not in fetched list, add to unsupported list
        unsupportedWalletTokens[tokenAddress] = {
          address: walletToken.tokenAddress,
          chainId: chainId,
          decimals: walletToken.decimals,
          logoURI: "/icons/tokens/defaultToken.svg",
          name: walletToken.name,
          symbol: walletToken.symbol,
          balance: walletToken.balance,
          hidden: true,
        }
      }
    }
  }

  const finalResult = {
    ...supportedWalletTokensResult,
    ...unsupportedWalletTokens,
    ...updatedTokenList,
  }

  return finalResult
}
