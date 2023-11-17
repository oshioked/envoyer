import {
  MAX_REASONABLE_ETA,
  MAX_RETRY_ATTEMPTS,
  RETRY_INTERVAL_MS,
} from "@/constants/txs"
import { waitForTransaction } from "wagmi/actions"
import { compareStringsIgnoreCase, sleep } from "./utils"
import { SendData } from "@/contexts/ActivityProvider/ActivityProvider"
import Moralis from "moralis"
import { SUPPORTED_CHAIN } from "@/constants/chains"
import { SEND_STATUS } from "@/constants/send"

export const processPendingTransactions = async (
  pendingSendsArray: SendData[],
  config: {
    chainId: number
    onSendSuccess: Function
    onSendFailed: Function
    halfwayCallback?: Function //After half of the max number of retries are done, this gets called
    onTimeout: Function // When all the retries are done. this gets called
  }
) => {
  const { chainId, onSendFailed, onSendSuccess, halfwayCallback, onTimeout } =
    config
  const processTransaction = async (send: SendData) => {
    if (send.chainId !== chainId) return

    let retryCount = 0
    let gottenResult = false

    while (!gottenResult && retryCount < MAX_RETRY_ATTEMPTS) {
      try {
        const data = await waitForTransaction({
          hash: send.txHash as `0x${string}`,
          confirmations: 10,
        })

        if (data.status === "success") {
          gottenResult = true
          onSendSuccess(send)
        } else {
          gottenResult = true
          onSendFailed(send)
        }
      } catch (error) {
        // Increment retry count and wait for a specified interval before retrying
        retryCount++
        await sleep(RETRY_INTERVAL_MS)
      }

      if (retryCount === Math.ceil(MAX_RETRY_ATTEMPTS / 2) && halfwayCallback) {
        halfwayCallback(send)
      }
    }

    if (!gottenResult) {
      // Max retry attempts reached
      onTimeout(send)
    }
  }

  // Use Promise.all to process transactions in parallel
  await Promise.all(pendingSendsArray.map(processTransaction))
}

export const getNativeTokenTransfers = async ({
  address,
  chainId,
  sliceAt = 5,
}: {
  address: string
  chainId: number
  sliceAt?: number
}) => {
  let nativeTokenResults: SendData[] = []

  const nativeCurrency = SUPPORTED_CHAIN[chainId].nativeCurrency
  if (!nativeCurrency) return []

  //Get wallet transactions
  const txs = await Moralis.EvmApi.transaction.getWalletTransactions({
    address,
    chain: chainId,
  })

  for (let i = 0; i < txs.result.length; i++) {
    const tx = txs.result[i]
    const { from, to, hash, blockTimestamp, data, value } = tx.toJSON()

    //Get native token transfers
    if (
      from.toLowerCase() === address.toLowerCase() &&
      to &&
      value !== "0" &&
      data === "0x" // No data so likely not contract interaction
    ) {
      nativeTokenResults.push({
        txHash: hash,
        tokenAmt: value || "",
        to,
        tokenAddress: nativeCurrency.address,
        tokenSymbol: nativeCurrency.symbol,
        status: SEND_STATUS.success,
        time: blockTimestamp,
        chainId: chainId,
      })
    }
  }

  return nativeTokenResults.length ? nativeTokenResults.slice(0, sliceAt) : []
}

export const getERC20TokensTransfers = async ({
  address,
  chainId,
  sliceAt = 5,
}: {
  address: string
  chainId: number
  sliceAt?: number
}) => {
  const response = await Moralis.EvmApi.token.getWalletTokenTransfers({
    chain: chainId,
    address,
  })

  const results = response.raw.result

  if (!results.length) return []

  const erc20TokensResult: SendData[] = results
    .slice(0, sliceAt)
    .filter((result) => compareStringsIgnoreCase(result.from_address, address))
    .map((result) => ({
      txHash: result.transaction_hash,
      tokenAmt: result.value,
      to: result.to_address,
      tokenAddress: result.address,
      status: SEND_STATUS.success,
      time: result.block_timestamp,
      tokenSymbol: result.token_symbol,
      chainId: chainId,
    }))

  return erc20TokensResult
}

export const fetchMainnetTransactionEstimatedTime = async (
  gasPrice: number
) => {
  if (!gasPrice) return
  const response = await fetch(
    `https://api.etherscan.io/api?module=gastracker&action=gasestimate&gasprice=${gasPrice}&apikey=${process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY}`
  )
  const responseJson = await response.json()
  const { status, result } = responseJson

  //The etherscan api returns really high absurd numbers sometimes So we set a max
  if (Number(status) && Number(result) < MAX_REASONABLE_ETA) {
    return Math.ceil(Number(result) / 60) //Returns value in mins
  }
}
