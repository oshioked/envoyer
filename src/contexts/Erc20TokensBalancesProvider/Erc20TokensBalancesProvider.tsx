import { useAccount } from "wagmi"
import Moralis from "moralis"
import { GetWalletTokenBalancesJSONResponse } from "moralis/common-evm-utils"
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import { useAppChain } from "../AppChainProvider/AppChainProvider"
import { weiToEther } from "@/utils/utils"
import { SUPPORTED_CHAIN } from "@/constants/chains"
interface ERC20Balance {
  tokenAddress: string
  balance: string
  symbol: string
  name: string
  decimals: number
}
interface ERC20Balances {
  [tokenAddress: string]: ERC20Balance
}

interface Erc20TokensBalancesContextProps {
  isLoading: boolean
  nativeBalance: string
  walletERC20Balances: ERC20Balances
}

const Erc20TokensBalancesContext =
  createContext<Erc20TokensBalancesContextProps>(
    {} as Erc20TokensBalancesContextProps
  )

const Erc20TokensBalancesProvider = (props: { children: ReactNode }) => {
  const { chain } = useAppChain()
  const { address } = useAccount()

  const [isLoading, setIsLoading] = useState(false)
  const [nativeBalance, setNativeBalance] = useState("0")
  const [walletERC20Balances, setWalletERC20Balances] = useState<ERC20Balances>(
    {}
  )

  const getAllErc20TokensInWallet = useCallback(async () => {
    if (!address) {
      setNativeBalance("0")
      setWalletERC20Balances({})
      return
    }
    setIsLoading(true)
    try {
      if (Moralis.Core.isStarted) {
        // Get native token balance
        const nativeResponse = await Moralis.EvmApi.balance.getNativeBalance({
          address: address || "",
          chain: chain.id,
        })
        const nativeBal = nativeResponse.toJSON().balance

        const nativeCurrency = SUPPORTED_CHAIN[chain.id].nativeCurrency
        const nativeBalObj: ERC20Balance = {
          balance: weiToEther(Number(nativeBal), nativeCurrency.decimals),
          tokenAddress: nativeCurrency.address.toLowerCase(),
          decimals: nativeCurrency.decimals,
          symbol: nativeCurrency.symbol,
          name: nativeCurrency.name,
        }

        // Get rest erc20 token balances
        const response = await Moralis.EvmApi.token.getWalletTokenBalances({
          address: address || "",
          chain: chain.id,
        })
        const result = response.toJSON()

        const mappedResult: ERC20Balances = result.reduce(
          (acc: any, value) => {
            const tokenAddress = value.token_address
            acc[tokenAddress.toLowerCase()] = {
              tokenAddress: tokenAddress,
              balance: weiToEther(Number(value.balance), value.decimals),
              name: value.name,
              symbol: value.symbol,
              decimals: value.decimals,
            }
            return acc
          },
          {
            [nativeCurrency.address.toLowerCase()]: nativeBalObj,
          } as ERC20Balances
        )

        setNativeBalance(
          weiToEther(
            Number(nativeBal),
            SUPPORTED_CHAIN[chain.id].nativeCurrency.decimals
          )
        )
        setWalletERC20Balances(mappedResult)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }, [address, chain])

  useEffect(() => {
    getAllErc20TokensInWallet()
  }, [getAllErc20TokensInWallet])

  return (
    <Erc20TokensBalancesContext.Provider
      value={{
        nativeBalance,
        walletERC20Balances,
        isLoading,
      }}
    >
      {props.children}
    </Erc20TokensBalancesContext.Provider>
  )
}

export const useWalletTokensBalances = () => {
  const value = useContext(Erc20TokensBalancesContext)
  return value
}

export default Erc20TokensBalancesProvider
