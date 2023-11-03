import React from "react"

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "disabled"

interface CustomButtonProps {
  variant?: ButtonVariant
}

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    CustomButtonProps {}

// const colors = {
//   primary: {
//     bg: "#67FCC3",
//     text: "black",
//   },
//   secondary: {
//     bg: "#375449",
//     text: "#67FCC3",
//   },
// }

const Button = (props: ButtonProps) => {
  const { variant, ...rest } = props
  const className = {
    primary: "text-black bg-[#67FCC3]",
    secondary: "text-[#67FCC3] bg-[#375449]",
    tertiary: "text-[#FFFFFFDE] bg-[#1C2026]",
    disabled: "text-[#ffffff50] bg-[#131417]",
  }

  return (
    <button
      {...rest}
      className={` rounded-[15px] px-10 py-[13px] font-extrabold  whitespace-nowrap ${
        className[props.variant || "primary"]
      } ${props.className || ""}`}
    >
      {props.children}
    </button>
  )
}

export default Button
