import moment from "moment"

export const formatIpfsImage = (url: string) =>
  url.includes("ipfs") ? url.replace("ipfs://", "https://ipfs.io/ipfs/") : url

export const getTokenLogoUrl = (url: string) =>
  url ? (url.includes("ipfs") ? formatIpfsImage(url) : url) : ""

export const formatAddress = (address: string) =>
  `${address.slice(0, 4)}....${address.slice(
    address.length - 4,
    address.length
  )}`

export const compareStringsIgnoreCase = (str1: string, str2: string) => {
  const lowerStr1 = str1.toLowerCase()
  const lowerStr2 = str2.toLowerCase()

  return lowerStr1 === lowerStr2
}

export const formatShortDate = (date: Date) => {
  const now = moment()
  const duration = moment.duration(now.diff(date))

  if (duration.asSeconds() < 60) {
    return Math.floor(duration.asSeconds()) + "s"
  } else if (duration.asMinutes() < 60) {
    return Math.floor(duration.asMinutes()) + "min"
  } else if (duration.asHours() < 24) {
    return Math.floor(duration.asHours()) + "h"
  } else if (duration.asDays() < 30) {
    return Math.floor(duration.asDays()) + "d"
  } else if (duration.asMonths() < 12) {
    return Math.floor(duration.asMonths()) + "mo"
  } else {
    return Math.floor(duration.asYears()) + "y"
  }
}

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
