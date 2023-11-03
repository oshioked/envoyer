import React, { ReactNode } from "react"
import Button from "../Button/Button"

type Option = {
  name: string
  child?: ReactNode
}
export const SwitchControl = (props: {
  options: Option[]
  selected: string
  setSelectedOption: Function
}) => {
  return (
    <div className="flex p-2 bg-[#1C2026] rounded-[16px] w-full">
      {props.options.map((option: Option) => (
        <Button
          key={option.name}
          onClick={() => props.setSelectedOption(option.name)}
          className={`flex-1 text-white !py-[10px] ${
            props.selected === option.name ? "!bg-[#101114]" : "bg-transparent"
          }`}
        >
          {option.child ? option.child : option.name}
        </Button>
      ))}
    </div>
  )
}
