// import { EvmChain } from "moralis/common-evm-utils"
import { useContractRead, useFeeData } from "wagmi"

const useGasPrice = () => {
  const { data, isError, isLoading } = useFeeData({
    chainId: 42161,
    formatUnits: "gwei",
  })

  // console.log({ data, isError, isLoading })

  return { data, isError, isLoading }
}

export default useGasPrice
