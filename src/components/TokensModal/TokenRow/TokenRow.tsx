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
  const activeClassNames = "transition duration-400 hover:bg-background-primary"
  return (
    <div
      onClick={() => props.onSelectToken()}
      className={`flex justify-between items-center py-[10px] px-[20px] cursor-pointer ${
        props.selected ? selectedClassNames : activeClassNames
      }`}
    >
      <div className="flex gap-3 items-center">
        <Image
          className="w-[32px] h-[32px] rounded-full border border-separator-1"
          src={props.img}
          width={32}
          height={32}
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
