import Image from "next/image"
import React from "react"
import Skeleton from "react-loading-skeleton"
interface TokenRowProps {
  img: string
  name: string
  symbol: string
  balance?: string
  isLoadingBalance?: boolean
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
        {props.isLoadingBalance ? (
          <div className="h-13 w-[40px]">
            <Skeleton />
          </div>
        ) : (
          <p className="opacity-50">
            {props.balance ? Number(props.balance).toFixed(3) : 0}
          </p>
        )}
        {props.selected && (
          <Image
            loading="eager"
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

export const TokenRowLoading = () => {
  return (
    <div className={`flex justify-between py-[10px] px-5 `}>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 mt-[-4px]">
          <Skeleton circle containerClassName="w-8 h-8" className="w-8 h-8" />
        </div>
        <div className="flex flex-col gap-1">
          <div className="w-[60px] h-3">
            <Skeleton />
          </div>
          <div className="w-[140px]">
            <Skeleton className="w-[100px] h-[9px]" />
          </div>
        </div>
      </div>
      <div className="flex items-center h-full">
        <div>
          <div className="h-13 w-[40px]">
            <Skeleton />
          </div>
        </div>
      </div>
    </div>
  )
}

export default TokenRow
