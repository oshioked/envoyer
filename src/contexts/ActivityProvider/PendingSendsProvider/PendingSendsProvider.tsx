import useLocalStorageState from "@/hooks/useLocalStorageState"
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
} from "react"
import { toast } from "react-toastify"
import { useRecentSends } from "../RecentSendsProvider/RecentSendsProvider"
import { useAppChain } from "@/contexts/AppChainProvider/AppChainProvider"
import { formatAddress } from "@/utils/utils"
import { SendData, SendStatus } from "../ActivityProvider"
import { SEND_STATUS } from "@/constants/send"
import { useWalletTokensBalances } from "@/contexts/TokensBalancesProvider/TokensBalancesProvider"
import { processPendingTransactions } from "@/utils/transactions"
import { weiToEther } from "@/utils/tokens"

interface PendingSendsContextProps {
  addNewPendingSend: (send: SendData) => void
  pendingSends: SendData[]
}

export const PendingSendsContext = createContext<PendingSendsContextProps>(
  {} as PendingSendsContextProps
)

const PendingSendsProvider = (props: { children: ReactNode }) => {
  const { chain: connectedChain } = useAppChain()
  const [pendingSends, setPendingSends] = useLocalStorageState<{
    [chainId: string]: {
      [txHash: string]: SendData
    }
  }>(`pendingSends`, {})
  const { addConfirmedSend: addToRecentSends } = useRecentSends()

  const { refetch: refetchBalances } = useWalletTokensBalances()

  const addNewPendingSend = (send: SendData) => {
    setPendingSends({
      ...pendingSends,
      [send.chainId]: { ...pendingSends[send.chainId], [send.txHash]: send },
    })
  }

  //Listens for pending transactions, wait for them and notify user
  useEffect(() => {
    const moveToRecentSends = (send: SendData, status: SendStatus) => {
      //Add to recent sends with success status
      addToRecentSends(
        {
          ...pendingSends[send.chainId][send.txHash],
          status: status,
        },
        send.chainId
      )

      //Remove send from pending sends
      const newPendingSend = { ...pendingSends[send.chainId] }
      delete newPendingSend[send.txHash]
      setPendingSends({
        ...pendingSends,
        [send.chainId]: newPendingSend,
      })
    }

    //Wait for all pending sends
    const getPendingTxsDetails = async () => {
      const pendingSendsArray = Object.values(
        pendingSends[connectedChain.id] || {}
      )
      if (!pendingSendsArray.length) return

      await processPendingTransactions(pendingSendsArray, {
        chainId: connectedChain.id,
        onSendSuccess: (send: SendData) => {
          //Show success toast notification
          if (!toast.isActive(send.txHash)) {
            toast.success(
              `Sent ${weiToEther(Number(send.tokenAmt))} ${
                send.tokenSymbol
              }  to ${formatAddress(send.to)}`,
              {
                toastId: send.txHash,
              }
            )
          }
          refetchBalances() //Refetch wallet balances
          moveToRecentSends(send, SEND_STATUS.success)
        },
        onSendFailed: (send: SendData) => {
          // Show error toast notification
          if (!toast.isActive(send.txHash)) {
            toast.error(
              `Failed to send ${weiToEther(Number(send.tokenAmt))} ${
                send.tokenSymbol
              }  to ${formatAddress(send.to)}`,
              {
                toastId: send.txHash,
              }
            )
          }
          moveToRecentSends(send, SEND_STATUS.failed)
        },
        onTimeout: () => {},
        halfwayCallback: (send: SendData) => {
          //TODO - Decide whether to show a half way notification
          //   if (!toast.isActive(send.txHash)) {
          //     toast.info(
          //       `Sending ${weiToEther(Number(send.tokenAmt))} ${
          //         send.tokenSymbol
          //       }  to ${formatAddress(
          //         send.to
          //       )} taking long. Speed up transaction`,
          //       {
          //         toastId: send.txHash,
          //       }
          //     )
          //   }
        },
      })
    }

    getPendingTxsDetails()
  }, [
    connectedChain.id,
    pendingSends,
    addToRecentSends,
    setPendingSends,
    refetchBalances,
  ])

  const pendingSendsArray = useMemo(() => {
    const result = Object.values(pendingSends[connectedChain.id] || {})
    return result
  }, [pendingSends, connectedChain.id])

  return (
    <PendingSendsContext.Provider
      value={{ addNewPendingSend, pendingSends: pendingSendsArray }}
    >
      {props.children}
    </PendingSendsContext.Provider>
  )
}

export const usePendingSends = () => {
  const value = useContext(PendingSendsContext)
  return value
}

export default PendingSendsProvider
