export const getCachedData = (key: string, cacheTime: number) => {
  //Try to get item from cache and cacheTimestamp
  const cachedData = JSON.parse(localStorage.getItem(key) as string)
  const cacheTimestamp = localStorage.getItem(`${key}_timestamp`)
  const currentTime = new Date().getTime()

  if (
    cachedData &&
    cacheTimestamp &&
    currentTime - Number(cacheTimestamp) <= cacheTime
  ) {
    console.log(`Getting ${key} from cache`)
    // Data is still within the cache time, use the cached data.
    return cachedData
  }
}

export const setCacheData = (key: string, data: any) => {
  //Set cache data
  localStorage.setItem(key, JSON.stringify(data))
  //Set now as saved timeStamp
  localStorage.setItem(`${key}_timestamp`, new Date().getTime().toString())
}
