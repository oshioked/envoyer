import Navbar from "@/components/Navbar/Navbar"
import SendCard from "@/components/SendCard/SendCard"
import TokensModal from "@/components/TokensModal/TokensModal"
import { useCallback, useEffect, useState } from "react"
import { SettingsCard } from "@/components/SettingsCard/SettingsCard"
import { ActivityCard } from "@/components/ActivityCard/ActivityCard"
import { DEFAULT_CHAIN_ID, SUPPORTED_CHAIN } from "@/constants/chains"
import { useAppChain } from "@/contexts/AppChainProvider/AppChainProvider"
import TransactionModal from "@/components/TransactionModal/TransactionModal"
import { usePendingSends } from "@/contexts/ActivityProvider/PendingSendsProvider/PendingSendsProvider"
import StatusDotIndicator from "@/components/StatusDotIndicator/StatusDotIndicator"
import { SEND_STATUS } from "@/constants/send"
import ChainModal from "@/components/ChainModal/ChainModal"
import { TabSwitchControl } from "@/components/TabSwitchControl/TabSwitchControl"
import { SendData } from "@/contexts/ActivityProvider/ActivityProvider"
import { useErc20Tokens } from "@/contexts/Erc20TokensListProvider/Erc20TokensListProvider"
import { useAccount } from "wagmi"
import { weiToEther } from "@/utils/tokens"
import useLocalStorageState from "@/hooks/useLocalStorageState"

export default function Home() {
  const { chain } = useAppChain()
  const { tokens } = useErc20Tokens()
  const { isConnected } = useAccount()
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
  const [sideFormState, setSideFormState] = useState<
    "Settings" | "Activity" | "Send" //Send is an option on mobile
  >("Activity")

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
    if (selectedToken?.chainId !== chain.id) {
      const nativeCurrency = SUPPORTED_CHAIN[chain.id].nativeCurrency
      if (nativeCurrency) {
        setSelectedToken(nativeCurrency)
      }
    }
  }, [chain.id, selectedToken?.chainId, setSelectedToken])

  //if wallet not connected hide confirm modal if last save state was open
  useEffect(() => {
    if (!isConnected && isConfirmModalOpen) {
      setIsConfirmModalOpen(false)
    }
  }, [isConnected, isConfirmModalOpen, setIsConfirmModalOpen])

  const populateSendForm = (send: SendData) => {
    //Populate form
    const token = tokens[send.tokenAddress.toLowerCase()]
    const amt = weiToEther(Number(send.tokenAmt), token.decimals)
    if (!token) return
    setSelectedToken(token)
    setAmount(Number(amt))
    setRecipientAddress(send.to)
  }

  return (
    <main
      className={`bg-background-primary flex min-h-screen flex-col items-center justify-between`}
    >
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
          token: selectedToken as Token,
        }}
        resetForm={resetForm}
      />
      <Navbar />
      <div className="flex-1 flex justify-center w-full py-7 md:py-[70px] px-5 md:px-[10%]">
        <div className="flex-1 flex flex-col gap-5 max-w-[1010px]">
          <h2 className="text-label-primary text-[18px] md:text-[22px] font-bold hidden md:block">
            Seamlessly Send ERC-20 Tokens
          </h2>

          {/* Cards container */}
          <div className="flex flex-1 md:flex-none flex-col md:flex-row items-center gap-5">
            <div className="flex-1 w-full hidden min-w-[350px] md:flex">
              <SendCard
                selectedToken={selectedToken}
                setIsTokensModalOpen={setIsTokensModalOpen}
                recipientAddress={recipientAddress}
                setRecipientAddress={setRecipientAddress}
                amount={amount}
                setAmount={setAmount}
                openConfirmSendModal={() => setIsConfirmModalOpen(true)}
              />
            </div>
            <div className="flex flex-col items-center md:justify-center gap-5 w-full md:w-[360px] flex-1 md:flex-none h-full">
              <TabSwitchControl
                options={[
                  {
                    name: "Send",
                    onlyOnMobile: true,
                  },
                  {
                    name: "Activity",
                    child: (
                      <div className="flex justify-center items-center gap-2">
                        Activity
                        {Boolean(numberOfPendingSends) &&
                          sideFormState !== "Activity" && (
                            <StatusDotIndicator
                              status={SEND_STATUS.processing}
                            />
                          )}
                      </div>
                    ),
                  },
                  {
                    name: "Settings",
                  },
                ]}
                selected={sideFormState}
                setSelectedOption={setSideFormState}
              />
              {sideFormState === "Send" ? (
                <SendCard
                  selectedToken={selectedToken}
                  setIsTokensModalOpen={setIsTokensModalOpen}
                  recipientAddress={recipientAddress}
                  setRecipientAddress={setRecipientAddress}
                  amount={amount}
                  setAmount={setAmount}
                  openConfirmSendModal={() => setIsConfirmModalOpen(true)}
                />
              ) : (
                <div className="bg-background-secondary border border-separator-primary rounded-[16px] overflow-auto w-full flex flex-1 h-full max-h-[390px]">
                  {sideFormState === "Settings" ? (
                    <SettingsCard />
                  ) : (
                    <ActivityCard populateSendForm={populateSendForm} />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
