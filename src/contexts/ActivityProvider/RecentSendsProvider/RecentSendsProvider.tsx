import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import Moralis from "moralis"
import { useAccount } from "wagmi"
import { SEND_STATUS } from "@/constants/send"
import { compareStringsIgnoreCase } from "@/utils/utils"
import { useAppChain } from "../../AppChainProvider/AppChainProvider"
import { SendData } from "../ActivityProvider"
import { SUPPORTED_CHAIN } from "@/constants/chains"
import { transferABI } from "@/hooks/useSendToken"
import { decodeFunctionData } from "viem"

interface RecentSendsContextProps {
  isLoading: boolean
  recentSends: SendData[]
  addConfirmedSend: (send: SendData, chainId: number) => void
}

const RecentSendsContext = createContext<RecentSendsContextProps>(
  {} as RecentSendsContextProps
)

const RecentSendsProvider = (props: { children: ReactNode }) => {
  const { address } = useAccount()
  const { chain } = useAppChain()
  const [justConfirmedSends, setJustConfirmedSends] = useState<{
    [chainId: number]: SendData[]
  }>({})
  const [fetchedRecentSends, setFetchedRecentSends] = useState<{
    [chainId: number]: SendData[]
  }>({})
  const [isLoading, setIsLoading] = useState(false)

  const addConfirmedSend = (send: SendData, chainId: number) => {
    const existing = fetchedRecentSends[chainId].find(
      (s) => s.txHash === send.txHash
    )
    if (!existing) {
      setJustConfirmedSends({
        ...justConfirmedSends,
        [chainId]: [send, ...(justConfirmedSends[chainId] || [])],
      })
    }
  }

  const getRecentTransfers = useCallback(async () => {
    if (!address || !Moralis.Core.isStarted) return
    try {
      setIsLoading(true)

      //Get Native token transfers

      const txs = await Moralis.EvmApi.transaction.getWalletTransactions({
        address,
        chain: chain.id,
      })

      let nativeTokenResults: SendData[] = []
      const nativeCurrency = SUPPORTED_CHAIN[chain.id].nativeCurrency

      for (let i = 0; i < txs.result.length; i++) {
        const tx = txs.result[i]
        const { from, to, hash, blockTimestamp, data } = tx.toJSON()

        if (
          from.toLowerCase() === address.toLowerCase() &&
          to?.toLowerCase() === nativeCurrency.address.toLowerCase()
        ) {
          const { functionName, args } = decodeFunctionData({
            abi: transferABI,
            data: data as `0x${string}`,
          })

          if (functionName === "transfer") {
            nativeTokenResults.push({
              txHash: hash,
              tokenAmt: args ? (args[1] as string) : "",
              to: args ? (args[0] as string) : "",
              tokenAddress: nativeCurrency.address,
              tokenSymbol: nativeCurrency.symbol,
              status: SEND_STATUS.success,
              time: blockTimestamp,
              chainId: chain.id,
            })
          }
        }
      }

      //Get ERC20 token transfers
      const response = await Moralis.EvmApi.token.getWalletTokenTransfers({
        chain: chain.id,
        address,
      })

      const erc20TokensResult: SendData[] = response.raw.result
        .slice(0, 5)
        .filter((result) =>
          compareStringsIgnoreCase(result.from_address, address)
        )
        .map((result) => ({
          txHash: result.transaction_hash,
          tokenAmt: result.value,
          to: result.to_address,
          tokenAddress: result.address,
          status: SEND_STATUS.success,
          time: result.block_timestamp,
          tokenSymbol: result.token_symbol,
          chainId: chain.id,
        }))

      const combinedResult = [
        ...nativeTokenResults.slice(0, 5),
        ...erc20TokensResult,
      ]

      combinedResult.sort(
        (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
      )

      setFetchedRecentSends({
        [chain.id]: combinedResult, //
      })
    } catch (error) {
      console.log("Error getting recent transfers", error)
    } finally {
      setIsLoading(false)
    }
  }, [address, chain.id])

  useEffect(() => {
    getRecentTransfers()
  }, [getRecentTransfers])

  const combineRecentSends = useMemo(() => {
    //Filter just confirmed sends in case fetched sends has a just confirmed tx already
    let filteredConfirmedSends: SendData[] = []
    if (
      justConfirmedSends[chain.id] &&
      justConfirmedSends[chain.id].length &&
      fetchedRecentSends[chain.id]?.length
    ) {
      filteredConfirmedSends = justConfirmedSends[chain.id]?.filter(
        (send) => send.txHash !== fetchedRecentSends[chain.id][0]?.txHash
      )
    }
    return [...filteredConfirmedSends, ...(fetchedRecentSends[chain.id] || [])]
  }, [justConfirmedSends, fetchedRecentSends, chain.id])

  return (
    <RecentSendsContext.Provider
      value={{
        addConfirmedSend,
        recentSends: combineRecentSends,
        isLoading,
      }}
    >
      {props.children}
    </RecentSendsContext.Provider>
  )
}

export const useRecentSends = () => {
  const value = useContext(RecentSendsContext)
  return value
}

export default RecentSendsProvider
