import { useAccount } from "wagmi"
import Moralis from "moralis"
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import { useAppChain } from "../AppChainProvider/AppChainProvider"
import { SUPPORTED_CHAIN } from "@/constants/chains"
import { weiToEther } from "@/utils/tokens"
import { fetchBalance } from "wagmi/actions"
import { useMoralisInitialized } from "../MoralisProvider/MoralisProvider"
interface TokenBalance {
  tokenAddress: string
  balance: string
  symbol: string
  name: string
  decimals: number
}
export interface TokenBalances {
  [tokenAddress: string]: TokenBalance
}

interface TokensBalancesContextProps {
  isLoading: boolean
  nativeBalance: string
  walletTokensBalances: TokenBalances
  refetch: () => void
}

const TokensBalancesContext = createContext<TokensBalancesContextProps>(
  {} as TokensBalancesContextProps
)

const TokensBalancesProvider = (props: { children: ReactNode }) => {
  const { chain } = useAppChain()
  const { address } = useAccount()
  const { isInitialized: isMoralisInitialized } = useMoralisInitialized()

  const [isLoading, setIsLoading] = useState(false)
  const [nativeBalance, setNativeBalance] = useState("0")
  const [walletTokensBalances, setWalletTokensBalances] =
    useState<TokenBalances>({})
  const [shouldRefetch, setShouldRefetch] = useState({})

  const getAllTokensInWallet = useCallback(async () => {
    if (!address || !isMoralisInitialized) {
      setNativeBalance("0")
      setWalletTokensBalances({})
      return
    }
    setIsLoading(true)
    try {
      // Get Native token balance
      const nativeBalanceResponse = await fetchBalance({
        address: address || "",
        chainId: chain.id,
        formatUnits: "ether",
      })
      const nativeBal = nativeBalanceResponse.value

      const nativeCurrency = SUPPORTED_CHAIN[chain.id].nativeCurrency
      const nativeBalObj: TokenBalance = {
        balance: weiToEther(Number(nativeBal), nativeCurrency.decimals),
        tokenAddress: nativeCurrency.address.toLowerCase(),
        decimals: nativeCurrency.decimals,
        symbol: nativeCurrency.symbol,
        name: nativeCurrency.name,
      }

      // Get rest ERC20 token balances
      const walletErc20BalancesResponse =
        await Moralis.EvmApi.token.getWalletTokenBalances({
          address: address || "",
          chain: chain.id,
        })
      const walletErc20Balances = walletErc20BalancesResponse.toJSON()

      //Map token addresses to balances starting with the native currency
      const mappedResult: TokenBalances = walletErc20Balances.reduce(
        (balances: TokenBalances, value) => {
          const tokenAddress = value.token_address
          balances[tokenAddress.toLowerCase()] = {
            tokenAddress: tokenAddress,
            balance: weiToEther(Number(value.balance), value.decimals),
            name: value.name,
            symbol: value.symbol,
            decimals: value.decimals,
          }
          return balances
        },
        {
          [nativeCurrency.address.toLowerCase()]: nativeBalObj,
        } as TokenBalances
      )

      setNativeBalance(
        weiToEther(
          Number(nativeBal),
          SUPPORTED_CHAIN[chain.id].nativeCurrency.decimals
        )
      )

      setWalletTokensBalances(mappedResult)
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }, [address, chain, isMoralisInitialized])

  useEffect(() => {
    getAllTokensInWallet()
  }, [getAllTokensInWallet, shouldRefetch])

  const refetch = useCallback(() => {
    setShouldRefetch({})
  }, [setShouldRefetch])

  return (
    <TokensBalancesContext.Provider
      value={{
        isLoading,
        nativeBalance,
        walletTokensBalances,
        refetch,
      }}
    >
      {props.children}
    </TokensBalancesContext.Provider>
  )
}

export const useWalletTokensBalances = () => {
  const value = useContext(TokensBalancesContext)
  return value
}

export default TokensBalancesProvider
