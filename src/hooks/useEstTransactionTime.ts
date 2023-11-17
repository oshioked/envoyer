import { GAS_OPTION_DEFAULT } from "@/constants/gas"
import { useAppChain } from "@/contexts/AppChainProvider/AppChainProvider"
import { useSettings } from "@/contexts/SettingsProvider/SettingsProvider"
import { fetchMainnetTransactionEstimatedTime } from "@/utils/transactions"
import { useCallback, useEffect, useState } from "react"
import { mainnet } from "wagmi"
import { fetchFeeData } from "wagmi/actions"

const useEstTransactionTime = () => {
  const { chain } = useAppChain()

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [estConfirmationTime, setEstConfirmationTime] = useState<number>()

  const {
    gas: { selectedGasOption },
  } = useSettings()
  const selectedGasPriority = GAS_OPTION_DEFAULT[selectedGasOption]?.priority

  const getFees = useCallback(async () => {
    //Only mainnet etherscan api provides transaction est time endpoint
    if (chain.id !== mainnet.id) return

    try {
      setIsLoading(true)
      const { gasPrice } = await fetchFeeData()
      const result = await fetchMainnetTransactionEstimatedTime(
        Math.ceil(Number(gasPrice) * selectedGasPriority)
      )
      setEstConfirmationTime(result)
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }, [chain.id, selectedGasPriority])

  useEffect(() => {
    getFees()
  }, [getFees])

  return {
    isLoading,
    estConfirmationTime,
  }
}

export default useEstTransactionTime
