import React from "react"

interface CustomButtonProps {}

interface TextButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    CustomButtonProps {}

const TextButton = (props: TextButtonProps) => {
  const { className, children, ...rest } = props
  return (
    <button
      {...rest}
      className={`inline-flex whitespace-nowrap font-medium ${"text-accent-primary"}  ${
        props.className || ""
      }`}
    >
      {props.children}
    </button>
  )
}

export default TextButton
