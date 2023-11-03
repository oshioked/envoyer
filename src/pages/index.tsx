import Navbar from "@/components/Navbar/Navbar"
import Footer from "@/components/Footer/Footer"
import SendCard from "@/components/SendCard/SendCard"
import TokensModal from "@/components/TokensModal/TokensModal"
import { useCallback, useEffect } from "react"
import { SettingsCard } from "@/components/SettingsCard/SettingsCard"
import { ActivityCard } from "@/components/ActivityCard/ActivityCard"
import { DEFAULT_CHAIN_ID, SUPPORTED_CHAIN } from "@/constants/chains"
import { useAppChain } from "@/contexts/AppChainProvider/AppChainProvider"
import TransactionModal from "@/components/TransactionModal/TransactionModal"
import { usePendingSends } from "@/contexts/ActivityProvider/PendingSendsProvider/PendingSendsProvider"
import StatusDotIndicator from "@/components/StatusDotIndicator/StatusDotIndicator"
import { SEND_STATUS } from "@/constants/send"
import useLocalStorageState from "@/hooks/useLocalStorageState"
import ChainModal from "@/components/ChainModal/ChainModal"
import { SwitchControl } from "@/components/SwitchControl/SwitchControl"

export default function Home() {
  const { chain } = useAppChain()
  const defaultNativeCurrency =
    SUPPORTED_CHAIN[chain?.id || DEFAULT_CHAIN_ID].nativeCurrency

  const { pendingSends } = usePendingSends()
  const numberOfPendingSends = Object.values(pendingSends).length

  const [isTokensModalOpen, setIsTokensModalOpen] = useLocalStorageState(
    "isTokensModalOpen",
    false
  )
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useLocalStorageState(
    "isConfirmModalOpen",
    false
  )
  const [sideFormState, setSideFormState] = useLocalStorageState<
    "Settings" | "Activity"
  >("sideFormState", "Activity")

  const [amount, setAmount] = useLocalStorageState("amount", 0)
  const [selectedToken, setSelectedToken] = useLocalStorageState<
    Token | undefined
  >("selectedToken", defaultNativeCurrency)
  const [recipientAddress, setRecipientAddress] = useLocalStorageState(
    "recipientAddress",
    ""
  )

  const resetForm = useCallback(() => {
    setAmount(0)
    setRecipientAddress("")
  }, [setAmount, setRecipientAddress])

  //Update initial selectedToken when chain changes
  useEffect(() => {
    if (selectedToken.chainId !== chain.id) {
      const nativeCurrency = SUPPORTED_CHAIN[chain.id].nativeCurrency
      if (nativeCurrency) {
        setSelectedToken(nativeCurrency)
      }
    }
  }, [chain.id, selectedToken.chainId, setSelectedToken])

  return (
    <main className={`flex min-h-screen flex-col items-center justify-between`}>
      <TokensModal
        isOpen={isTokensModalOpen}
        setIsOpen={setIsTokensModalOpen}
        selectedTokenAddress={selectedToken?.address || ""}
        setSelectedToken={setSelectedToken}
      />
      <ChainModal />
      <TransactionModal
        isOpen={isConfirmModalOpen}
        setIsOpen={setIsConfirmModalOpen}
        sendDetails={{
          toAddress: recipientAddress,
          amount,
          token: selectedToken,
        }}
        resetForm={resetForm}
      />
      <Navbar />
      <div className="flex-1 flex justify-center w-full py-[70px] px-[10%]">
        <div className="flex-1 flex flex-col gap-5 max-w-[1010px]">
          <h2 className="text-[22px] font-bold">
            Seamlessly Send ERC-20 Tokens
          </h2>

          {/* Cards container */}
          <div className="flex items-center gap-5">
            <SendCard
              selectedToken={selectedToken}
              setIsTokensModalOpen={setIsTokensModalOpen}
              recipientAddress={recipientAddress}
              setRecipientAddress={setRecipientAddress}
              amount={amount}
              setAmount={setAmount}
              openConfirmSendModal={() => setIsConfirmModalOpen(true)}
            />

            <div className="flex flex-col items-center justify-center gap-5 w-[360px] h-full">
              <SwitchControl
                options={[
                  {
                    name: "Settings",
                  },
                  {
                    name: "Activity",
                    child: (
                      <div className="flex justify-center items-center gap-2">
                        Activity
                        {Boolean(numberOfPendingSends) && (
                          <StatusDotIndicator status={SEND_STATUS.processing} />
                        )}
                      </div>
                    ),
                  },
                ]}
                selected={sideFormState}
                setSelectedOption={setSideFormState}
              />

              <div className="bg-[#1C2026] rounded-[16px] overflow-auto w-full flex flex-1 max-h-[390px]">
                {sideFormState === "Settings" ? (
                  <SettingsCard />
                ) : (
                  <ActivityCard />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
