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

export interface RecentSend {
  txHash: string
  tokenAmt: string
  to: string
  tokenAddress: string
  status: string
  time: string
}

interface RecentSendsContextProps {
  isLoading: boolean
  recentSends: RecentSend[]
  addNewSend: (send: RecentSend) => void
}
const RecentSendsContext = createContext<RecentSendsContextProps>(
  {} as RecentSendsContextProps
)

const RecentSendsProvider = (props: { children: ReactNode }) => {
  const { address } = useAccount()
  const { chain } = useAppChain()
  const [justConfirmedSends, setJustConfirmedSends] = useState<RecentSend[]>([])
  const [recentSends, setRecentSend] = useState<RecentSend[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addNewSend = (send: RecentSend) => {
    const existing = recentSends.find((s) => s.txHash === send.txHash)
    if (!existing) {
      setJustConfirmedSends([send, ...justConfirmedSends])
    }
  }

  const getRecentTransfers = useCallback(async () => {
    if (!address) return
    try {
      if (Moralis.Core.isStarted) {
        setIsLoading(true)
        const response = await Moralis.EvmApi.token.getWalletTokenTransfers({
          chain: chain.id,
          address,
        })
        const result = response.raw.result
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
          }))

        console.log({ response }, "@recent sends")

        setRecentSend(result)
      }
    } catch (error) {
      console.log(error)
      console.log("Error getting recent transfers, 'recent sends")
    } finally {
      setIsLoading(false)
    }
  }, [address, chain.id])

  useEffect(() => {
    getRecentTransfers()
  }, [getRecentTransfers])

  const combineRecentSends = useMemo(() => {
    //Filter in case fetched sends has tx already
    const filteredConfirmedSends = justConfirmedSends.filter(
      (send) => send.txHash !== recentSends[0].txHash
    )
    console.log({ filteredConfirmedSends, recentSends })
    return [...filteredConfirmedSends, ...recentSends]
  }, [justConfirmedSends, recentSends])

  return (
    <RecentSendsContext.Provider
      value={{
        addNewSend,
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
