export const DEFAULT_CHAIN_ID = 42161

export const SUPPORTED_CHAIN: { [id: number]: any } = {
  1: {
    id: 1,
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
    },
    blockExplorers: {
      default: { name: "Etherscan", url: "https://etherscan.io" },
    },
    testnet: false,
  },
  137: {
    id: 137,
    name: "Polygon",
    network: "polygon",
    iconUrl: "/icons/tokens/polygon.svg",
    iconBackground: "#fff",
    nativeCurrency: {
      address: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
      name: "Polygon",
      symbol: "MATIC",
      decimals: 18,
      logoURI:
        "https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png?1624446912",
    },
    blockExplorers: {
      default: { name: "Polygonscan", url: "https://polygonscan.com" },
    },
    testnet: false,
  },
  42161: {
    id: 42161,
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
