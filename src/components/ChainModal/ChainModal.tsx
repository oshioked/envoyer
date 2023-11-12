import React from "react"
import Modal from "../Modal/Modal"
import TextButton from "../TextButton/TextButton"
import Image from "next/image"
import { useAppChain } from "@/contexts/AppChainProvider/AppChainProvider"
import { SUPPORTED_CHAIN } from "@/constants/chains"
import LoadingIndicator from "../LoadingIndicator/LoadingIndicator"

const ChainModal = () => {
  const {
    chain,
    switchSelectedChain,
    setIsChainModalVisible,
    isChainModalVisible,
    pendingChainId,
    status,
  } = useAppChain()

  const selectedClassNames = "opacity-50"
  const activeClassNames = "transition duration-400 hover:bg-background-primary"

  return (
    <Modal
      contentClassName="w-[85%] md:w-[322px] p-[10px] border border-separator-1"
      isOpen={isChainModalVisible}
      setIsOpen={setIsChainModalVisible}
    >
      <div className="flex flex-col gap-4">
        <div className="flex justify-between py-[20px] px-[10px] border-b border-separator-2">
          <p>Select a network</p>
          <TextButton onClick={() => setIsChainModalVisible(false)}>
            <Image
              loading="eager"
              src={"/icons/close.svg"}
              width={24}
              height={24}
              alt=""
            />
          </TextButton>
        </div>

        <div>
          {Object.values(SUPPORTED_CHAIN).map((network, i) => (
            <div
              key={i}
              onClick={() =>
                chain.id === network.id ? null : switchSelectedChain(network.id)
              }
              className={`flex justify-between rounded-2xl items-center py-[12px] px-[15px] cursor-pointer ${
                chain.id === network.id ? selectedClassNames : activeClassNames
              }`}
            >
              <div className="flex gap-3 items-center">
                <Image
                  className="w-[28px] h-[28px] rounded-full border border-separator-1"
                  src={network.iconUrl}
                  width={28}
                  height={28}
                  alt=""
                />
                <div>
                  <p className=" text-[15px]">{network.name}</p>
                </div>
              </div>

              {pendingChainId === network.id && status === "loading" && (
                <div className="flex items-center gap-2">
                  <p className="text-sm opacity-50">Approve in wallet</p>
                  <LoadingIndicator isLoading className="!h-3 !w-3" />
                </div>
              )}
              {chain.id === network.id && (
                <Image
                  loading="eager"
                  src={"/icons/accentCheckMark.svg"}
                  width={20}
                  height={20}
                  alt=""
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </Modal>
  )
}

export default ChainModal
