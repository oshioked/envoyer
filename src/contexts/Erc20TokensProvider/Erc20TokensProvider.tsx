import React, {
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
  createContext,
} from "react"
import { useAppChain } from "@/contexts/AppChainProvider/AppChainProvider"
import useLocalStorageState from "@/hooks/useLocalStorageState"
import { SUPPORTED_CHAIN } from "@/constants/chains"
import { useWalletTokensBalances } from "../Erc20TokensBalancesProvider/Erc20TokensBalancesProvider"

export const KLEROS_LIST = "https://t2crtokens.eth.link/"
export const UNISWAP_TOKEN_LIST =
  "https://gateway.ipfs.io/ipns/tokens.uniswap.org"

interface Erc20TokensContextProps {
  tokens?: { [address: string]: Token }
}

export const Erc20TokensContext = createContext<Erc20TokensContextProps>({})

export const ERC20TokensProvider = (props: { children: ReactNode }) => {
  const [allChainsTokens, setAllChainsTokens] = useLocalStorageState<{
    [chainId: number]: { [tokenAddress: string]: Token }
  }>("allChainsTokens", {})
  const { chain } = useAppChain()
  const { walletERC20Balances, nativeBalance } = useWalletTokensBalances()

  useEffect(() => {
    const getListFromUrl = async () => {
      try {
        const tokenListUrls = [UNISWAP_TOKEN_LIST, KLEROS_LIST]
        const allTokens = []

        // fetch token lists from multiple URLs
        for (const url of tokenListUrls) {
          try {
            const result = await fetch(url).then((res) => res.json())
            const tokenList = result.tokens
            allTokens.push(...tokenList)
          } catch (error) {
            console.error(`Error fetching token list from ${url}: ${error}`)
          }
        }

        // Remove duplicate tokens based on their address
        const uniqueTokens = allTokens.reduce((result, token) => {
          const isDuplicate = result.find(
            (t: any) => t.address === token.address
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

        // const sortTokensAlphabetically = (groupedTokens: any) => {
        //   const sortedTokens: any = {}

        //   for (const chainId in groupedTokens) {
        //     if (groupedTokens.hasOwnProperty(chainId)) {
        //       sortedTokens[chainId] = Object.fromEntries(
        //         Object.entries(groupedTokens[chainId]).sort((a: any, b: any) =>
        //           a[1].symbol.localeCompare(b[1].symbol)
        //         )
        //       )
        //     }
        //   }

        //   return sortedTokens
        // }

        // const sortedTokens = sortTokensAlphabetically(groupedTokens)

        setAllChainsTokens(groupedTokens)
        return groupedTokens
      } catch (error) {
        console.log(error)
      }
    }

    getListFromUrl()
  }, [])

  const combinedWalletBalancesAndTokenList = useMemo(() => {
    if (!allChainsTokens || !walletERC20Balances) return {}
    const chainTokens = allChainsTokens[chain.id]
    if (!chainTokens) return

    const combinedResult: { [address: string]: any } = {}
    const updatedTokenList = { ...chainTokens }

    //Add the native token to display list first
    const nativeToken = SUPPORTED_CHAIN[chain.id].nativeCurrency
    if (nativeToken) {
      combinedResult[nativeToken?.address.toLowerCase()] = {
        ...nativeToken,
        balance: nativeBalance ? nativeBalance : "",
      }
    }

    //get each wallet token info from the full token list and push to combinedResult
    for (let i = 0; i < Object.keys(walletERC20Balances).length; i++) {
      const walletToken = Object.values(walletERC20Balances)[i]
      const tokenAddress = walletToken.tokenAddress.toLowerCase()

      if (chainTokens[tokenAddress]) {
        combinedResult[tokenAddress] = {
          ...chainTokens[tokenAddress],
          balance: walletToken.balance,
        }
        delete updatedTokenList[tokenAddress]
      }
    }

    const finalResult = Object.assign(
      {},
      combinedResult,
      Object.assign({}, combinedResult, updatedTokenList as {})
    )

    console.log({ finalResult })

    return finalResult
  }, [allChainsTokens, walletERC20Balances, chain?.id, nativeBalance])

  return (
    <Erc20TokensContext.Provider
      value={{ tokens: combinedWalletBalancesAndTokenList }}
    >
      {props.children}
    </Erc20TokensContext.Provider>
  )
}

export const useErc20Tokens = () => {
  const { tokens } = useContext(Erc20TokensContext)

  return tokens || {}
}
