import Image from "next/image"
import React from "react"
interface TokenRowProps {
  img: string
  name: string
  symbol: string
  balance?: string
  selected?: boolean
  onSelectToken: Function
}
const TokenRow = (props: TokenRowProps) => {
  const selectedClassNames = "opacity-50"
  const activeClassNames = "transition duration-400 hover:bg-[#101114]"
  return (
    <div
      onClick={() => props.onSelectToken()}
      className={`flex justify-between items-center py-[10px] px-[20px] cursor-pointer ${
        props.selected ? selectedClassNames : activeClassNames
      }`}
    >
      <div className="flex gap-3 items-center">
        <Image
          className="w-[36px] h-[36px] rounded-full border border-[#FFFFFF26]"
          src={props.img}
          width={34}
          height={34}
          alt=""
        />
        <div>
          <p className=" text-[15px]">{props.name}</p>
          <p className="text-xs opacity-30">{props.symbol}</p>
        </div>
      </div>
      <div className="flex gap-2 items-center">
        <p className="opacity-50">{props.balance}</p>
        {props.selected && (
          <Image
            src={"/icons/accentCheckMark.svg"}
            width={20}
            height={20}
            alt=""
          />
        )}
      </div>
    </div>
  )
}

export default TokenRow
