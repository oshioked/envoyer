import React, { InputHTMLAttributes, ReactNode } from "react"

interface CustomInputProps {
  containerClassName?: string
}

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>,
    CustomInputProps {}

const TextInput = (props: InputProps) => {
  const { containerClassName, ...rest } = props
  return (
    <div
      className={`bg-background-primary pt-4 pb-[27px] px-6 gap-4 rounded-[15px] flex flex-col ${
        props.containerClassName || ""
      }`}
    >
      {Boolean(props["aria-label"]) && <label>{props["aria-label"]}</label>}
      <input
        className="bg-transparent outline-none"
        placeholder="Enter recipient address"
        {...rest}
      />
    </div>
  )
}

export default TextInput
