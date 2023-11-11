import { arbitrum, mainnet, polygon } from "viem/chains"

export const DEFAULT_CHAIN_ID = arbitrum.id

export interface AppChain {
  id: number
  name: string
  network: string
  iconUrl: string
  iconBackground: string
  nativeCurrency: Token
  blockExplorers: {
    default: { name: string; url: string }
  }
  testnet: false
}

export const SUPPORTED_CHAIN: { [id: number]: AppChain } = {
  [mainnet.id]: {
    id: mainnet.id,
    name: "Ethereum",
    network: "ethereum",
    iconUrl: "/icons/tokens/eth.svg",
    iconBackground: "#fff",
    nativeCurrency: {
      address: "0x0000000000000000000000000000000000000000",
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
      logoURI: "/icons/tokens/eth.svg",
      chainId: mainnet.id,
    },
    blockExplorers: {
      default: { name: "Etherscan", url: "https://etherscan.io" },
    },
    testnet: false,
  },
  [polygon.id]: {
    id: polygon.id,
    name: "Polygon",
    network: "polygon",
    iconUrl: "/icons/tokens/polygon.svg",
    iconBackground: "#fff",
    nativeCurrency: {
      address: "0x0000000000000000000000000000000000001010",
      name: "Polygon",
      symbol: "MATIC",
      decimals: 18,
      logoURI:
        "https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png?1624446912",
      chainId: polygon.id,
    },
    blockExplorers: {
      default: { name: "Polygonscan", url: "https://polygonscan.com" },
    },
    testnet: false,
  },
  [arbitrum.id]: {
    id: arbitrum.id,
    name: "Arbitrum",
    network: "arbitrum",
    iconUrl: "/icons/tokens/arbitrum.svg",
    iconBackground: "#fff",
    nativeCurrency: {
      address: "0x0000000000000000000000000000000000000000",
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
      logoURI: "/icons/tokens/eth.svg",
      chainId: arbitrum.id,
    },
    blockExplorers: {
      default: {
        name: "Arbitrum Explorer",
        url: "https://arbiscan.io/",
      },
    },
    testnet: false,
  },
}
