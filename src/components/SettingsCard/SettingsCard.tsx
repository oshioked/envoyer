import Image from "next/image"
import React from "react"
import { useSettings } from "@/contexts/SettingsProvider/SettingsProvider"
import GasOptionButton from "../GasPriorityButton/GasPriorityButton"
import Message from "../MessageTag/MessageTag"

export const SettingsCard = () => {
  const {
    gas: { selectedGasOption, setSelectedGasOption },
  } = useSettings()
  return (
    <div className="py-[30px] px-[20px] flex-1 flex flex-col gap-5">
      <div className="flex flex-col gap-3 ">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-2">
            <Image src="/icons/gas.svg" width={20} height={20} alt="" />
            <p className="opacity-60">Gas priority</p>
          </div>
        </div>
        <GasOptionButton
          selectedGasOption={selectedGasOption}
          setSelectedGasOption={setSelectedGasOption}
        />
        <Message
          message={
            selectedGasOption === "low"
              ? "Normal: Standard speed with regular network fees"
              : "Fast: Speedy transactions with increased network fees"
          }
          type="message"
        />
      </div>
    </div>
  )
}
