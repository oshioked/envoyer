import useLocalStorageState from "@/hooks/useLocalStorageState"
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
} from "react"
import { toast } from "react-toastify"
import { waitForTransaction } from "wagmi/actions"
import { useRecentSends } from "../RecentSendsProvider/RecentSendsProvider"
import { useAppChain } from "@/contexts/AppChainProvider/AppChainProvider"
import { formatAddress, weiToEther } from "@/utils/utils"
import { SendData } from "../ActivityProvider"
import { SEND_STATUS } from "@/constants/send"
import { useWalletTokensBalances } from "@/contexts/Erc20TokensBalancesProvider/Erc20TokensBalancesProvider"

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
      [send.chainId]: { [send.txHash]: send },
    })
  }

  //Listens for pending transactions, wait for them and notify user
  useEffect(() => {
    const getPendingTxsDetails = async () => {
      const pendingSendsArray = Object.values(
        pendingSends[connectedChain.id] || {}
      )
      if (!pendingSendsArray.length) return

      //Wait for all pending sends
      for (let send of pendingSendsArray) {
        if (send.chainId !== connectedChain.id) return
        try {
          const data = await waitForTransaction({
            hash: send.txHash as `0x${string}`,
            confirmations: 5,
          })

          if (data.status === "success") {
            // Show success toast
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

            //Refetch wallet balances
            refetchBalances()

            //Add to recent sends with success status
            addToRecentSends(
              {
                ...pendingSends[send.chainId][send.txHash],
                status: SEND_STATUS.success,
              },
              send.chainId
            )
          } else {
            // Show error toast
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

            //TODO - If this causes a problem, just don't add to recent send and show only toast
            //Add to recent sends with status failed
            addToRecentSends(
              {
                ...pendingSends[send.chainId][send.txHash],
                status: SEND_STATUS.failed,
              },
              connectedChain.id
            )
          }
        } catch (error) {
          console.log("Failed to wait for tx", error)
        } finally {
          //Remove send from pending sends
          const newPendingSend = { ...pendingSends[send.chainId] }
          delete newPendingSend[send.txHash]
          setPendingSends({ ...pendingSends, [send.chainId]: newPendingSend })
        }
      }
    }

    getPendingTxsDetails()
  }, [pendingSends, setPendingSends, addToRecentSends, connectedChain.id])

  //TODO - See if you can change pending sends type to an array so there'll be no need for this
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
