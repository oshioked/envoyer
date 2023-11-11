import React, {
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  createContext,
} from "react"
import { useAppChain } from "@/contexts/AppChainProvider/AppChainProvider"
import useLocalStorageState from "@/hooks/useLocalStorageState"
import { SUPPORTED_CHAIN } from "@/constants/chains"
import { useWalletTokensBalances } from "../TokensBalancesProvider/TokensBalancesProvider"
import { UNISWAP_TOKEN_LIST, KLEROS_LIST } from "@/constants/tokens"
import {
  combinedWalletBalancesAndTokenList,
  fetchTokenListFromUrls,
} from "@/utils/tokens"

interface Erc20TokensContextProps {
  tokens?: { [address: string]: Token }
}

export const Erc20TokensContext = createContext<Erc20TokensContextProps>({})

const ERC20TokensListProvider = (props: { children: ReactNode }) => {
  const { chain } = useAppChain()
  const { walletTokensBalances, nativeBalance } = useWalletTokensBalances()

  const [allChainsTokens, setAllChainsTokens] = useLocalStorageState<{
    [chainId: number]: { [tokenAddress: string]: Token }
  }>("allChainsTokens", {})

  useEffect(() => {
    const getTokens = async () => {
      try {
        const tokens = await fetchTokenListFromUrls()
        setAllChainsTokens(tokens)
      } catch (error) {
        console.log(error)
      }
    }
    getTokens()
  }, [setAllChainsTokens])

  //Combine wallet tokens and fetched tokens in the right order
  const tokenListwithWalletBalances = useMemo(() => {
    if (!allChainsTokens || !walletTokensBalances) return

    const chainTokens = allChainsTokens[chain.id]
    if (!chainTokens) return

    const combinedResult = combinedWalletBalancesAndTokenList({
      chainTokens,
      walletTokensBalances,
      chainId: chain.id,
    })
    return combinedResult
  }, [allChainsTokens, walletTokensBalances, chain?.id])

  return (
    <Erc20TokensContext.Provider
      value={{ tokens: tokenListwithWalletBalances }}
    >
      {props.children}
    </Erc20TokensContext.Provider>
  )
}

export const useErc20Tokens = () => {
  const { tokens } = useContext(Erc20TokensContext)

  return tokens || {}
}

export default ERC20TokensListProvider
