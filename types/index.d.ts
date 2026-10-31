export type Usage = {
  usd: number | null
  fiveHour: number | null
  sevenDay: number | null
  contextPercent: number | null
  contextTokens: number | null
  contextWindow: number | null
  at: number
}

declare module 'claude-code' {
  interface PluginState {
    'usage-band': { usage: Usage | null; isHidden: boolean }
  }
}
