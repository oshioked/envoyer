import React, { useState } from "react"

const ToggleButton = (props: {
  isOn: boolean
  setIsOn: (isOn: boolean) => void
}) => {
  const { isOn, setIsOn } = props

  const toggleSwitch = () => {
    setIsOn(!isOn)
  }

  return (
    <label className="flex items-center cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={isOn}
          onChange={toggleSwitch}
        />
        <div className="block bg-background-tertiary w-10 h-5 rounded-full" />
        <div
          className={`absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform duration-300 transform ${
            isOn ? "translate-x-5 !bg-accent-primary" : ""
          }`}
        />
      </div>
    </label>
  )
}

export default ToggleButton
