import Moralis from "moralis"
import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"

const MoralisContext = createContext({
  isInitialized: false,
})
const MoralisProvider = (props: { children: ReactNode }) => {
  const [isInitialized, setIsIntialized] = useState(false)

  const initializeMoralis = useCallback(async () => {
    try {
      if (!Moralis.Core.isStarted) {
        await Moralis.start({
          apiKey: process.env.NEXT_PUBLIC_MORALIS_API_KEY,
        })
        setIsIntialized(true)
      }
    } catch (error) {
      console.log("Failed to initialize moralis", error)
    }
  }, [])

  useEffect(() => {
    initializeMoralis()
  }, [initializeMoralis])

  return (
    <MoralisContext.Provider value={{ isInitialized }}>
      {props.children}
    </MoralisContext.Provider>
  )
}

export const useMoralisInitialized = () => {
  const value = useContext(MoralisContext)

  return value
}

export default MoralisProvider
