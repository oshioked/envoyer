import React, {
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  createContext,
  useState,
} from "react"
import { useAppChain } from "@/contexts/AppChainProvider/AppChainProvider"
import useLocalStorageState from "@/hooks/useLocalStorageState"
import { useWalletTokensBalances } from "../TokensBalancesProvider/TokensBalancesProvider"
import {
  combinedWalletBalancesAndTokenList,
  fetchTokenListFromUrls,
} from "@/utils/tokens"

interface Erc20TokensContextProps {
  tokens: { [address: string]: Token }
  isFetchingTokens: boolean
}

export const Erc20TokensContext = createContext<Erc20TokensContextProps>(
  {} as Erc20TokensContextProps
)

const ERC20TokensListProvider = (props: { children: ReactNode }) => {
  const { chain } = useAppChain()
  const { walletTokensBalances, nativeBalance } = useWalletTokensBalances()

  const [isFetchingTokens, setIsFetchingTokens] = useState(true)
  const [allChainsTokens, setAllChainsTokens] = useLocalStorageState<{
    [chainId: number]: { [tokenAddress: string]: Token }
  }>("allChainsTokens", {})

  useEffect(() => {
    const getTokens = async () => {
      try {
        setIsFetchingTokens(true)
        const tokens = await fetchTokenListFromUrls()
        setAllChainsTokens(tokens)
      } catch (error) {
        console.log(error)
      } finally {
        setIsFetchingTokens(false)
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
      value={{ tokens: tokenListwithWalletBalances || {}, isFetchingTokens }}
    >
      {props.children}
    </Erc20TokensContext.Provider>
  )
}

export const useErc20Tokens = () => {
  const value = useContext(Erc20TokensContext)

  return value
}

export default ERC20TokensListProvider
