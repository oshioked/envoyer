import React, { ReactNode, useEffect } from "react"
import Button from "../Button/Button"
import useIsMobile from "@/hooks/useIsMobile"

type Option = {
  name: string
  child?: ReactNode
  onlyOnMobile?: boolean
}
export const TabSwitchControl = (props: {
  options: Option[]
  selected: string
  setSelectedOption: Function
}) => {
  const isMobile = useIsMobile()
  const { options, selected, setSelectedOption } = props

  console.log({ isMobile })

  //If is mobile, set first mobile only tab as selected
  useEffect(() => {
    if (isMobile) {
      console.log("calling")
      const firstMobileOpton = options.find((option) => option.onlyOnMobile)
      setSelectedOption(firstMobileOpton?.name)
    }
  }, [isMobile])

  //If is not mobile and selected tab is a onlyOnMobile tab switch to the first tab
  useEffect(() => {
    const selectedOption = options.find((option) => option.name === selected)
    if (selected && selectedOption?.onlyOnMobile && !isMobile) {
      console.log("calling")
      const firstSelectableOption = options.find(
        (option) => !option.onlyOnMobile
      )
      setSelectedOption(firstSelectableOption?.name)
    }
  }, [isMobile, options, selected, setSelectedOption])

  return (
    <div className="flex items-center p-2 bg-background-secondary md:rounded-[16px] w-full h-[70px] md:h-auto fixed bottom-0 z-10 md:static">
      {props.options.map((option: Option) => (
        <Button
          key={option.name}
          onClick={() => props.setSelectedOption(option.name)}
          className={`flex-1 h-fit !px-0 !py-2 md:!py-[10px] font-semibold md:font-extrabold ${
            props.selected === option.name
              ? "!bg-background-primary text-label-1"
              : "!bg-transparent !text-label-3"
          } ${option.onlyOnMobile ? "md:hidden" : ""}`}
        >
          {option.child ? option.child : option.name}
        </Button>
      ))}
    </div>
  )
}
