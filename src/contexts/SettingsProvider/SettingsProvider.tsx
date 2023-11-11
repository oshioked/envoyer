import { GasOptionKey } from "@/constants/gas"
import useLocalStorageState from "@/hooks/useLocalStorageState"
import React, { ReactNode, createContext, useContext } from "react"

interface SettingsContextProps {
  gas: {
    selectedGasOption: GasOptionKey
    setSelectedGasOption: (optionKey: GasOptionKey) => void
  }
}
const SettingsContext = createContext<SettingsContextProps>({
  gas: {
    selectedGasOption: "low",
    setSelectedGasOption: (optionKey: GasOptionKey) => {},
  },
})
const SettingsProvider = (props: { children: ReactNode }) => {
  const [selectedGasOption, setSelectedGasOption] =
    useLocalStorageState<GasOptionKey>("selectedGasOption", "low")

  return (
    <SettingsContext.Provider
      value={{ gas: { selectedGasOption, setSelectedGasOption } }}
    >
      {props.children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => {
  const value = useContext(SettingsContext)
  return value
}
export default SettingsProvider
