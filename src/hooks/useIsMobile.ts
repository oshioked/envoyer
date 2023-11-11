import { useState, useEffect } from "react"

const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      const screenWidth = window.innerWidth
      if (screenWidth < breakpoint) {
        setIsMobile(true)
      } else {
        setIsMobile(false)
      }
    }

    window.addEventListener("resize", checkIfMobile)
    checkIfMobile()

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [breakpoint])

  return isMobile
}

export default useIsMobile
