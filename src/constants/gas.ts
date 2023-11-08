export type GasOptionKey = "low" | "high"

export const GAS_OPTION_DEFAULT: {
  [key: string]: { key: GasOptionKey; name: string; priority: number }
} = {
  low: { key: "low", name: "Normal", priority: 1 },
  high: { key: "high", name: "Fast", priority: 1.25 },
}
