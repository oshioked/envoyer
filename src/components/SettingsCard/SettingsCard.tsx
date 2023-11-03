import Image from "next/image"
import React from "react"
import GasSelectBox from "../GasSelectBox/GasSelectBox"
import useGasPrice from "@/hooks/useGasPrice"

export const SettingsCard = () => {
  const { data: gas, isError, isLoading } = useGasPrice()

  return (
    <div className="py-[30px] px-[20px] flex-1 flex flex-col gap-5">
      <div className="flex flex-col gap-6 ">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-2">
            <Image src="/icons/gas.svg" width={20} height={20} alt="" />
            <p className="opacity-60">Gas price</p>
          </div>
          <p>{Number(gas?.formatted.gasPrice)}</p>
        </div>
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-2">
            <Image src="/icons/time.svg" width={20} height={20} alt="" />
            <p className="opacity-60">Est transaction time</p>
          </div>
          <p>{`< 2 mins`}</p>
        </div>
      </div>

      <div>
        <GasSelectBox selectedIndex={0} />
      </div>
    </div>
  )
}
