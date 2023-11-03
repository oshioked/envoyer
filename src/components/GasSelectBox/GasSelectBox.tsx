import Image from "next/image"
import React from "react"

const gasOptions = [
  {
    title: "Low",
    time: "<2 mins",
    price: "$1.01",
  },
  {
    title: "Market",
    time: "<1 min",
    price: "$1.01",
  },
  {
    title: "Very fast",
    time: "< 1 min",
    price: "$1.01",
  },
]
const GasSelectBox = (props: { selectedIndex: number }) => {
  return (
    <div className="bg-[#101114] flex flex-col rounded-[15px]">
      {gasOptions.map((gas, i) => (
        <div
          key={i}
          className={`flex items-center justify-between py-[15px] px-5 border-[#FFFFFF33] cursor-pointer ${
            i + 1 !== gasOptions.length ? "border-b" : ""
          }`}
        >
          <div className="flex items-center gap-2">
            {props.selectedIndex === i ? (
              <Image
                src={"/icons/accentCheckMark.svg"}
                width={18}
                height={18}
                alt=""
              />
            ) : (
              <div className="w-3 h-3 border-[#ffffff6b] border rounded-full" />
            )}
            <p>
              <span className="opacity-80">{gas.title}</span>{" "}
              <span className="opacity-50 text-sm">{gas.time}</span>
            </p>
          </div>
          <p className="opacity-50 text-sm">{gas.price}</p>
        </div>
      ))}
    </div>
  )
}

export default GasSelectBox
