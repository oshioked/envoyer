import React, { ReactNode, useEffect, useRef } from "react"

const Modal = (props: {
  isOpen: boolean
  setIsOpen: Function
  children: ReactNode
  contentClassName?: string
}) => {
  const { setIsOpen } = props
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    containerRef.current?.addEventListener("click", (event) => {
      const target = event.target as HTMLElement
      if (target === containerRef.current) {
        setIsOpen(false)
      }
    })
  }, [containerRef, setIsOpen])

  return (
    <div
      ref={containerRef}
      className={` left-0 top-0 w-screen h-screen fixed z-10 bg-black bg-opacity-60 justify-center items-center ${
        props.isOpen ? "flex" : "hidden"
      }`}
    >
      <div
        className={`bg-[#1C2026] rounded-3xl  w-[450px] max-w-full ${props.contentClassName}`}
      >
        {props.children}
      </div>
    </div>
  )
}

export default Modal
