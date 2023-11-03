import "@/styles/globals.css"
import type { AppProps } from "next/app"
import "@rainbow-me/rainbowkit/styles.css"

import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit"
import { configureChains, createConfig, WagmiConfig } from "wagmi"
import { mainnet, polygon, optimism, arbitrum, base, zora } from "wagmi/chains"
import { alchemyProvider } from "wagmi/providers/alchemy"
import { publicProvider } from "wagmi/providers/public"
import Moralis from "moralis"
import { useEffect } from "react"
import { merge } from "lodash"
import { ERC20TokensProvider } from "@/contexts/Erc20TokensProvider/Erc20TokensProvider"
import PendingSendsProvider from "@/contexts/ActivityProvider/PendingSendsProvider/PendingSendsProvider"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import RecentSendsProvider from "@/contexts/ActivityProvider/RecentSendsProvider/RecentSendsProvider"
import "react-loading-skeleton/dist/skeleton.css"
import AppChainProvider from "@/contexts/AppChainProvider/AppChainProvider"
import Erc20TokensBalancesProvider from "@/contexts/Erc20TokensBalancesProvider/Erc20TokensBalancesProvider"
import { SkeletonTheme } from "react-loading-skeleton"
import ActivityProvider from "@/contexts/ActivityProvider/ActivityProvider"

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    polygon,
    mainnet,
    // optimism,
    arbitrum,
    //  base, zora
  ],
  [publicProvider()]
)

const { connectors } = getDefaultWallets({
  appName: "Envoyer",
  projectId: "Envoyer",
  chains,
})

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
})

const initializeMoralis = async () => {
  try {
    console.log("Initializing moralis")
    if (!Moralis.Core.isStarted) {
      await Moralis.start({
        apiKey: process.env.NEXT_PUBLIC_MORALIS_API_KEY,
        // ...and any other configuration
      })
      console.log("Moralis initialized")
    }
  } catch (error) {
    console.log("Failed to initialize moralis", error)
  }
}

const myTheme = merge(darkTheme(), {
  colors: {
    accentColor: "#2C5747",
    accentColorForeground: "#6FEABB",
  },
})

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    //Initialize moralis
    initializeMoralis()
  }, [])

  return (
    <SkeletonTheme baseColor="#252A32" highlightColor="#37393F">
      <WagmiConfig config={wagmiConfig}>
        <AppChainProvider>
          <Erc20TokensBalancesProvider>
            <ERC20TokensProvider>
              <ActivityProvider>
                <RainbowKitProvider theme={myTheme} chains={chains}>
                  <ToastContainer theme="dark" />
                  <Component {...pageProps} />
                </RainbowKitProvider>
              </ActivityProvider>
            </ERC20TokensProvider>
          </Erc20TokensBalancesProvider>
        </AppChainProvider>
      </WagmiConfig>
    </SkeletonTheme>
  )
}
