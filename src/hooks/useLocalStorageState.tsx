import { useState, useEffect } from "react"

function useLocalStorageState<T>(key: string, initialValue: T) {
  const isClient = typeof window !== "undefined"

  const [state, setState] = useState<T>(() => {
    if (isClient) {
      const storedValueJSON = localStorage.getItem(key)
      const storedValue = storedValueJSON ? JSON.parse(storedValueJSON) : null
      return storedValue ? storedValue : initialValue
    }
    return initialValue
  })

  useEffect(() => {
    if (isClient) {
      localStorage.setItem(key, JSON.stringify(state))
    }
  }, [key, state])

  // Update the state when local storage changes
  useEffect(() => {
    if (isClient) {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === key && e.newValue !== null) {
          setState(JSON.parse(e.newValue))
        }
      }

      window.addEventListener("storage", handleStorageChange)

      return () => {
        window.removeEventListener("storage", handleStorageChange)
      }
    }
  }, [key])

  return [state, setState] as const
}

export default useLocalStorageState
