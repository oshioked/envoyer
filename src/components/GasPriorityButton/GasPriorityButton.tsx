import { GAS_OPTION_DEFAULT, GasOptionKey } from "@/constants/gas"
import React from "react"
import Button from "../Button/Button"
import useLocalStorageState from "@/hooks/useLocalStorageState"

const GasOptionButton = (props: {
  selectedGasOption: GasOptionKey
  setSelectedGasOption: Function
}) => {
  const { selectedGasOption, setSelectedGasOption } = props
  return (
    <div className="flex bg-background-tertiary h-9 gap-[5px] p-[5px] rounded-[10px]">
      {Object.values(GAS_OPTION_DEFAULT).map((option, i) => (
        <Button
          key={option.key}
          className={`text-xs font-semibold rounded-[8px] !p-0 flex-1 ${
            option.key !== selectedGasOption ? "!bg-transparent" : ""
          }`}
          onClick={() => setSelectedGasOption(option.key as any)}
          variant="tertiary"
        >
          {option.name}
        </Button>
      ))}
    </div>
  )
}

export default GasOptionButton
