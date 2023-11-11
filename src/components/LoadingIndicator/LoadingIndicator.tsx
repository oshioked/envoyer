import React, { useState, useEffect } from "react"

function LoadingIndicator(props: {
  isLoading?: boolean
  success?: boolean
  error?: boolean
  className?: string
}) {
  const { isLoading, success, error, className } = props
  const [displaySpinner, setDisplaySpinner] = useState(isLoading)
  const [displayCheckmark, setDisplayCheckmark] = useState(success)
  const [displayErrorX, setDisplayErrorX] = useState(error)

  useEffect(() => {
    if (success) {
      setDisplayCheckmark(true)
      setDisplayErrorX(false)
      setDisplaySpinner(false)
    } else if (error) {
      setDisplayCheckmark(false)
      setDisplayErrorX(true)
      setDisplaySpinner(false)
    } else if (isLoading) {
      // Show the loading spinner
      setDisplaySpinner(true)
      setDisplayCheckmark(false)
      setDisplayErrorX(false)
    }
  }, [isLoading, success, error])

  return (
    <div
      className={`relative w-16 h-16 flex  justify-center items-center ${
        className || ""
      }`}
    >
      {displaySpinner && (
        <div className="w-full h-full border-t-4 border-accent-primary border-solid rounded-full animate-spin inset-0" />
      )}
      {displayCheckmark && (
        <div className=" inset-0 flex items-center justify-center">
          <div className="text-accent-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-10 h-10"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
      )}
      {displayErrorX && (
        <div className="w-full h-full inset-0 flex items-center justify-center">
          <div className="h-full text-status-error">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-full h-full"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  )
}

export default LoadingIndicator
