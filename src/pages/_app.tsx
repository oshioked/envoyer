import "@/styles/globals.css"
import type { AppProps } from "next/app"
import "@rainbow-me/rainbowkit/styles.css"

import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit"
import { configureChains, createConfig, WagmiConfig } from "wagmi"
import { mainnet, polygon, arbitrum, zora } from "wagmi/chains"
import { publicProvider } from "wagmi/providers/public"
import { merge } from "lodash"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "react-loading-skeleton/dist/skeleton.css"
import AppChainProvider from "@/contexts/AppChainProvider/AppChainProvider"
import TokensBalancesProvider from "@/contexts/TokensBalancesProvider/TokensBalancesProvider"
import { SkeletonTheme } from "react-loading-skeleton"
import ActivityProvider from "@/contexts/ActivityProvider/ActivityProvider"
import SettingsProvider from "@/contexts/SettingsProvider/SettingsProvider"
import ERC20TokensListProvider from "@/contexts/Erc20TokensListProvider/Erc20TokensListProvider"
import MoralisProvider from "@/contexts/MoralisProvider/MoralisProvider"

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [polygon, mainnet, arbitrum],
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

const myTheme = merge(darkTheme(), {
  colors: {
    accentColor: "#2C5747",
    accentColorForeground: "#6FEABB",
  },
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SkeletonTheme baseColor="#252A32" highlightColor="#37393F">
      <WagmiConfig config={wagmiConfig}>
        <MoralisProvider>
          <AppChainProvider>
            <SettingsProvider>
              <TokensBalancesProvider>
                <ERC20TokensListProvider>
                  <ActivityProvider>
                    <RainbowKitProvider theme={myTheme} chains={chains}>
                      <ToastContainer theme="dark" />
                      <Component {...pageProps} />
                    </RainbowKitProvider>
                  </ActivityProvider>
                </ERC20TokensListProvider>
              </TokensBalancesProvider>
            </SettingsProvider>
          </AppChainProvider>
        </MoralisProvider>
      </WagmiConfig>
    </SkeletonTheme>
  )
}
