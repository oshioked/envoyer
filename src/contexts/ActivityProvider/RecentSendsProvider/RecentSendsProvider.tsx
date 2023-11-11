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
import {
  getERC20TokensTransfers,
  getNativeTokenTransfers,
} from "@/utils/transactions"
import { useMoralisInitialized } from "@/contexts/MoralisProvider/MoralisProvider"

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
  const { isInitialized: isMoralisInitialized } = useMoralisInitialized()
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
    if (!address || !isMoralisInitialized) return
    try {
      setIsLoading(true)

      const nativeTokenTransfers = await getNativeTokenTransfers({
        address,
        chainId: chain.id,
      })

      const erc20TokenTransfers = await getERC20TokensTransfers({
        address,
        chainId: chain.id,
      })

      const combinedResult = [...nativeTokenTransfers, ...erc20TokenTransfers]
      combinedResult.sort(
        (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
      )

      setFetchedRecentSends({
        [chain.id]: combinedResult,
      })
    } catch (error) {
      console.log("Error getting recent transfers", error)
    } finally {
      setIsLoading(false)
    }
  }, [address, chain.id, isMoralisInitialized])

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
