export type Limit = { kind: string; percent: number }
export type Snapshot = {
  limits: Limit[]
  tokens: number | null
  window: number
  percent: number | null
  usd: number | null
}

declare module 'claude-code' {
  interface PluginState {
    'token-pet': { snap: Snapshot | null }
  }
}
