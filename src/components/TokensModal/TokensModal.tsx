import React, { useEffect, useState } from "react"
import Modal from "../Modal/Modal"
import TextInput from "../TextInput/TextInput"
import Image from "next/image"
import Button from "../Button/Button"
import TextButton from "../TextButton/TextButton"
import TokenRow from "./TokenRow/TokenRow"
import { compareStringsIgnoreCase, formatIpfsImage } from "@/utils/utils"
import { debounce } from "lodash"
import { useErc20Tokens } from "@/contexts/Erc20TokensProvider/Erc20TokensProvider"
import { isAddress } from "ethers"

const TokensModal = (props: {
  isOpen: boolean
  setIsOpen: Function
  selectedTokenAddress: string
  setSelectedToken: Function
}) => {
  const [displayedTokenList, setDisplayedTokenList] = useState<Token[]>()

  const tokens = useErc20Tokens()

  //Update displayedTokenList if combinedList changes
  useEffect(() => {
    setDisplayedTokenList(Object.values(tokens))
  }, [tokens])

  const onSearchInputChange = debounce((event) => {
    const { value } = event.target

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
            token.symbol.toLowerCase().includes(value) ||
            token.name.toLowerCase().includes(value)
        )
        setDisplayedTokenList(result)
      }
    }
  }, 700)

  const onSelectToken = (token: Token) => {
    props.setSelectedToken(token)
    props.setIsOpen(false)
  }

  return (
    <Modal
      contentClassName="border border-[#ffffff13] overflow-hidden"
      isOpen={props.isOpen}
      setIsOpen={props.setIsOpen}
    >
      <div className="flex flex-col">
        <div className="flex justify-between py-[22px] px-5 border-b border-[#FFFFFF33]">
          <p>Select a token</p>
          <TextButton onClick={() => props.setIsOpen(false)}>
            <Image src={"/icons/close.svg"} width={24} height={24} alt="" />
          </TextButton>
        </div>
        <div className="px-5 flex flex-col gap-4 border-b border-[#FFFFFF33] py-5">
          <TextInput
            containerClassName="!px-6 !py-4"
            placeholder="Search name, symbol or paste address"
            onChange={onSearchInputChange}
          />
          <div className="flex gap-3">
            <Button
              variant="tertiary"
              className="flex items-center gap-2 border-[0.5px] border-[#FFFFFF26] !py-[8px] !px-[10px]"
            >
              <Image
                src={"/icons/tokens/eth.svg"}
                width={20}
                height={20}
                alt=""
              />
              <p className="text-[15px]">ETH</p>
            </Button>
            <Button
              variant="tertiary"
              className="flex items-center gap-2 border-[0.5px] border-[#FFFFFF26] !py-[8px] !px-[10px]"
            >
              <Image
                src={"/icons/tokens/eth.svg"}
                width={20}
                height={20}
                alt=""
              />
              <p className="text-[15px]">ETH</p>
            </Button>
          </div>
        </div>
        {
          <div className="h-48  overflow-auto">
            {!displayedTokenList?.length ? (
              <p className="text-center pt-4">No results found</p>
            ) : (
              displayedTokenList?.map((token, i) => (
                <TokenRow
                  key={i}
                  name={token.name}
                  symbol={token.symbol}
                  img={
                    token.logoURI
                      ? token.logoURI.includes("ipfs")
                        ? formatIpfsImage(token.logoURI)
                        : token.logoURI
                      : ""
                  }
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
