import React from "react"

interface CustomButtonProps {
  textColor?: "green" | "red" | "orange" | "blue" | "gray"
}

interface TextButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    CustomButtonProps {}

const TextButton = (props: TextButtonProps) => {
  const { className, children, ...rest } = props
  return (
    <button
      {...rest}
      className={`inline-flex whitespace-nowrap font-medium ${
        // props.textColor ? colors[props.textColor] : colors.red
        "text-[#67FCC3]"
      }  ${props.className || ""}`}
    >
      {props.children}
    </button>
  )
}

export default TextButton
