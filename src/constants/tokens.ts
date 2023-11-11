import { arbitrum, mainnet, polygon } from "viem/chains"

export const NATIVE_TOKEN_ADDRESS: { [chainId: string]: string } = {
  [mainnet.id]: "0x0000000000000000000000000000000000000000",
  [arbitrum.id]: "0x0000000000000000000000000000000000000000",
  [polygon.id]: "0x0000000000000000000000000000000000001010",
}

export const WRAPPED_NATIVE_TOKEN_ADDRESSES: { [chainId: string]: string } = {
  [mainnet.id]: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  [arbitrum.id]: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
  [polygon.id]: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
}

export const COMMON_TOKENS: {
  [chainId: string]: { [tokenId: string]: string }
} = {
  [mainnet.id]: {
    GRT: "0xc944E90C64B2c07662A292be6244BDf05Cda44a7",
    ETH: "0x0000000000000000000000000000000000000000",
    USDT: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    BUSD: "0x4fabb145d64652a948d72533023f6e7a623c7c53",
  },
  [arbitrum.id]: {
    ARB: "0x912CE59144191C1204E64559FE8253a0e49E6548",
    ETH: "0x0000000000000000000000000000000000000000",
    USDT: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    USDC: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    // BUSD: "0x31190254504622cEFdFA55a7d3d272e6462629a2",
  },
  [polygon.id]: {
    // WETH: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
    ENS: "0xbD7A5Cf51d22930B8B3Df6d834F9BCEf90EE7c4f",
    MATIC: "0x0000000000000000000000000000000000001010",
    USDT: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    FET: "0x7583FEDDbceFA813dc18259940F76a02710A8905",
  },
}

//TOKENS LIST
export const UNISWAP_TOKEN_LIST =
  "https://gateway.ipfs.io/ipns/tokens.uniswap.org"
export const KLEROS_LIST = "https://t2crtokens.eth.link/"
