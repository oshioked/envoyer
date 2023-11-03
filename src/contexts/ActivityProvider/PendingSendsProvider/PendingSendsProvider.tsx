import useLocalStorageState from "@/hooks/useLocalStorageState"
import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import { toast } from "react-toastify"
import { TransactionReceipt } from "viem"

import { waitForTransaction } from "wagmi/actions"
import { useRecentSends } from "../RecentSendsProvider/RecentSendsProvider"
import { useAppChain } from "@/contexts/AppChainProvider/AppChainProvider"
import { formatAddress } from "@/utils/utils"

export interface PendingSend {
  txHash: string
  tokenAmt: string
  to: string
  tokenAddress: string
  status: string
  time: string
}

interface PendingSends {
  [txHash: string]: PendingSend
}

interface PendingSendsContextProps {
  addNewPendingSend: (
    send: PendingSend
  ) => Promise<{ success: boolean; error: boolean; data: TransactionReceipt }>
  pendingSends: { [txHash: string]: PendingSend }
}

export const PendingSendsContext = createContext<PendingSendsContextProps>(
  {} as PendingSendsContextProps
)

const PendingSendsProvider = (props: { children: ReactNode }) => {
  const { chain } = useAppChain()
  const [pendingSends, setPendingSends] = useLocalStorageState<PendingSends>(
    `pendingSends${chain.id}`,
    {}
  )
  const { addNewSend: addNewRecentSend, recentSends } = useRecentSends()

  const addNewPendingSend = async (send: PendingSend) => {
    setPendingSends({ ...pendingSends, [send.txHash]: send })

    const data = await waitForTransaction({
      hash: send.txHash as `0x${string}`,
      confirmations: 10,
    })

    //Remove from pending sends when waiting done
    const newPendingSend = { ...pendingSends }
    delete newPendingSend[send.txHash]
    setPendingSends(newPendingSend)

    if (data.status === "success") {
      return { success: true, error: false, data }
    } else {
      return { success: false, error: true, data }
    }
  }

  useEffect(() => {
    const getPendingTxsDetails = async () => {
      const pendingSendArray = Object.values(pendingSends)
      if (!pendingSendArray.length) return

      for (let send of pendingSendArray) {
        try {
          const data = await waitForTransaction({
            hash: send.txHash as `0x${string}`,
            confirmations: 10,
          })

          console.log("Finished waiting for tx", {
            data,
            toastInactive: !toast.isActive(send.txHash),
          })

          if (!toast.isActive(send.txHash)) {
            toast.success(
              `Sent ${send.tokenAmt}  to ${formatAddress(send.to)}`,
              {
                toastId: send.txHash,
              }
            )
          }
        } catch (error) {
          console.log("Failed to wait for tx")
        }

        const newPendingSend = { ...pendingSends }
        delete newPendingSend[send.txHash]
        setPendingSends(newPendingSend)

        //Add to recent sends
        addNewRecentSend(pendingSends[send.txHash])
      }
    }

    getPendingTxsDetails()
  }, [pendingSends, setPendingSends, addNewRecentSend])

  console.log({ pendingSends })
  return (
    <PendingSendsContext.Provider value={{ addNewPendingSend, pendingSends }}>
      {props.children}
    </PendingSendsContext.Provider>
  )
}

export const usePendingSends = () => {
  const value = useContext(PendingSendsContext)
  return value
}

export default PendingSendsProvider
