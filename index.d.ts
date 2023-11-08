type Token = {
  address: string
  chainId: number
  decimals: number
  extensions?: any
  logoURI: string
  name: string
  symbol: string
  balance?: string
  hidden?: booolean
}

// type Token = any

declare global {
  interface Window {
    ethereum: import("ethers").providers.ExternalProvider
  }
}

interface Window {
  ethereum: import("ethers").providers.ExternalProvider
}
