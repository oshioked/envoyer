import React, { useEffect, useMemo, useRef, useState } from "react"
import Modal from "../Modal/Modal"
import TextInput from "../TextInput/TextInput"
import Image from "next/image"
import Button from "../Button/Button"
import TextButton from "../TextButton/TextButton"
import TokenRow from "./TokenRow/TokenRow"
import { compareStringsIgnoreCase, getTokenLogoUrl } from "@/utils/utils"
import { debounce } from "lodash"
import { useErc20Tokens } from "@/contexts/Erc20TokensListProvider/Erc20TokensListProvider"
import { isAddress } from "ethers"
import { COMMON_TOKENS } from "@/constants/tokens"
import { useAppChain } from "@/contexts/AppChainProvider/AppChainProvider"
import ToggleButton from "../ToggleButton/ToggleButton"
import { useAccount } from "wagmi"

const TokensModal = (props: {
  isOpen: boolean
  setIsOpen: Function
  selectedTokenAddress: string
  setSelectedToken: Function
}) => {
  const tokens = useErc20Tokens()
  const { isConnected } = useAccount()
  const [displayedTokenList, setDisplayedTokenList] = useState<Token[]>()
  const [inputValue, setInputValue] = useState<string>("")
  const { chain } = useAppChain()
  const [showUnsupportedTokens, setShowUnsupportedTokens] = useState(false)

  const filterTokens = debounce((value) => {
    if (!value) {
      setDisplayedTokenList(Object.values(tokens))
    } else {
      if (isAddress(value)) {
        const result = Object.values(tokens)?.filter(
          (token) => token.address.toLowerCase() === value.toLowerCase()
        )
        setDisplayedTokenList(result)
      } else {
        const result = Object.values(tokens)?.filter(
          (token) =>
            token.symbol.toLowerCase().includes(value.toLowerCase()) ||
            token.name.toLowerCase().includes(value.toLowerCase())
        )
        setDisplayedTokenList(result)
      }
    }
  }, 700)

  const onInputChange = (event: any) => {
    const { value } = event.target
    setInputValue(value)
    filterTokens(value)
  }

  const onSelectToken = (token: Token) => {
    props.setSelectedToken(token)
    props.setIsOpen(false)
  }

  // Update displayedTokenList if combinedList (fetched token list) changes
  useEffect(() => {
    if (!Object.values(tokens).length) return
    setDisplayedTokenList(Object.values(tokens))
  }, [tokens])

  //Clear search input when modal closes
  useEffect(() => {
    if (!props.isOpen) {
      setInputValue("")
      filterTokens("")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.isOpen])

  const supportFilteredTokens = useMemo(
    () =>
      displayedTokenList?.filter((token) =>
        showUnsupportedTokens ? true : !token.hidden
      ),
    [displayedTokenList, showUnsupportedTokens]
  )

  return (
    <Modal
      contentClassName="w-[90%] md:w-auto border border-separator-0 overflow-hidden"
      isOpen={props.isOpen}
      setIsOpen={props.setIsOpen}
    >
      <div className="flex flex-col">
        <div className="flex justify-between py-[18px] md:py-[22px] px-5 border-b border-separator-2">
          <p>Select a token</p>
          <TextButton onClick={() => props.setIsOpen(false)}>
            <Image src={"/icons/close.svg"} width={24} height={24} alt="" />
          </TextButton>
        </div>
        <div className="px-5 flex flex-col gap-3 border-b border-separator-2 py-5">
          <TextInput
            value={inputValue}
            id="token-input"
            containerClassName="!px-6 !py-4"
            placeholder="Search name, symbol or paste address"
            onChange={onInputChange}
          />
          <div className="flex flex-wrap gap-3">
            {Object.values(COMMON_TOKENS[chain.id]).map((address) => {
              const token = tokens[address.toLowerCase()]
              return (
                <Button
                  key={address}
                  variant="tertiary"
                  className="flex items-center gap-2 border-[0.5px] bg-transparent border-separator-1 !py-[8px] !px-[10px]"
                  onClick={() => onSelectToken(token)}
                >
                  <Image
                    className="rounded-full"
                    src={getTokenLogoUrl(token?.logoURI)}
                    width={20}
                    height={20}
                    alt=""
                  />
                  <p className="text-[15px]">
                    {tokens[address.toLowerCase()]?.symbol}
                  </p>
                </Button>
              )
            })}
          </div>
          {isConnected && (
            <div className="flex justify-end items-center gap-2 mt-3">
              <p className="text-xs opacity-50">Hidden tokens</p>
              <ToggleButton
                isOn={showUnsupportedTokens}
                setIsOn={setShowUnsupportedTokens}
              />
            </div>
          )}
        </div>
        {
          <div className="h-48  overflow-auto">
            {!supportFilteredTokens?.length ? (
              <p className="text-center pt-4">No results found</p>
            ) : (
              supportFilteredTokens.map((token, i) => (
                <TokenRow
                  key={i}
                  name={token.name}
                  symbol={token.symbol}
                  img={token.logoURI ? getTokenLogoUrl(token.logoURI) : ""}
                  balance={token.balance ? token.balance : ""}
                  selected={compareStringsIgnoreCase(
                    props.selectedTokenAddress,
                    token.address
                  )}
                  onSelectToken={() => onSelectToken(token)}
                />
              ))
            )}
          </div>
        }
      </div>
    </Modal>
  )
}

export default TokensModal
