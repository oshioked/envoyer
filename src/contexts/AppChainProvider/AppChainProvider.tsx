import { AppChain, DEFAULT_CHAIN_ID, SUPPORTED_CHAIN } from "@/constants/chains"
import React, {
  useEffect,
  useState,
  createContext,
  ReactNode,
  useContext,
  useMemo,
} from "react"
import { useNetwork, useSwitchNetwork } from "wagmi"
import useLocalStorageState from "../../hooks/useLocalStorageState"

interface AppChainContextProps {
  chain: AppChain
  isSupportedChainConnected: boolean
  isChainModalVisible: boolean
  pendingChainId: number | undefined
  status: "error" | "success" | "loading" | "idle"
  shouldPerformChainDataFetch: boolean
  setIsChainModalVisible: (isVisible: boolean) => void
  switchSelectedChain: (chainId: number) => void
}

const AppChainContext = createContext<AppChainContextProps>(
  {} as AppChainContextProps
)

const AppChainProvider = (props: { children: ReactNode }) => {
  const [isChainModalVisible, setIsChainModalVisible] = useState(false)

  const [selectedChain, setSelectedChain] = useLocalStorageState(
    "selectedChain",
    SUPPORTED_CHAIN[DEFAULT_CHAIN_ID]
  )

  const { chain: connectedChain } = useNetwork()
  const { switchNetworkAsync, pendingChainId, status, reset } =
    useSwitchNetwork({
      onMutate: (chain) => {},
      onSuccess: (chain) => {
        // Switch app selected chain
        const newSelectedChain = SUPPORTED_CHAIN[chain.id]
        setSelectedChain(newSelectedChain)
        setIsChainModalVisible(false)
      },
      onError: (error, vars, ctx) => {
        reset()
        setIsChainModalVisible(false)
      },
    })

  const switchSelectedChain = async (chainId: number) => {
    try {
      if (!switchNetworkAsync) {
        // Just change app selected chain when switch wallet isn't defined when wallet not connected
        const newSelectedChain = SUPPORTED_CHAIN[chainId]
        setSelectedChain(newSelectedChain)
        setIsChainModalVisible(false)
      } else {
        await switchNetworkAsync?.(chainId)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    //If selected chain is different from connected chain. Switch selected chain to connected chain
    if (connectedChain?.id && connectedChain?.id !== selectedChain.id) {
      const newSelectedChain = SUPPORTED_CHAIN[connectedChain?.id]
      setSelectedChain(newSelectedChain || SUPPORTED_CHAIN[DEFAULT_CHAIN_ID])
    }
  }, [connectedChain?.id, selectedChain.id, setSelectedChain])

  const shouldPerformChainDataFetch = useMemo(() => {
    if (
      //if connected chain is supported but different from selected app chain, wait to switch before fetching
      connectedChain &&
      Boolean(SUPPORTED_CHAIN[connectedChain?.id]) &&
      selectedChain.id !== connectedChain?.id
    ) {
      return false
    } else {
      return true
    }
  }, [connectedChain, selectedChain])

  return (
    <AppChainContext.Provider
      value={{
        chain: selectedChain,
        isChainModalVisible,
        pendingChainId,
        status,
        isSupportedChainConnected: connectedChain?.id
          ? Boolean(SUPPORTED_CHAIN[connectedChain?.id])
          : false,
        shouldPerformChainDataFetch,
        switchSelectedChain,
        setIsChainModalVisible,
      }}
    >
      {props.children}
    </AppChainContext.Provider>
  )
}

export const useAppChain = () => {
  const result = useContext(AppChainContext)
  return result
}

export default AppChainProvider
