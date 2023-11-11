import React from "react"

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "disabled"

interface CustomButtonProps {
  variant?: ButtonVariant
}

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    CustomButtonProps {}

const Button = (props: ButtonProps) => {
  const { variant, ...rest } = props
  const className = {
    primary: "text-black bg-accent-primary",
    secondary: "text-accent-primary bg-accent-foreground",
    tertiary: "text-label-1 bg-background-secondary",
    disabled: "text-label-3 bg-background-primary",
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
