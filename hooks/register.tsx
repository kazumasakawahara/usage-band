import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Usage } from '../types'

const usage = atom({ plugin: 'usage-band', key: 'usage' } as const, null, { shape: 'usage-1' })
const isHidden = atom({ plugin: 'usage-band', key: 'isHidden' } as const, false)

const CELLS = 14

function bar(percent: number | null): string {
  if (percent === null) return '─'.repeat(CELLS)
  const filled = Math.min(CELLS, Math.round((percent / 100) * CELLS))
  return '▰'.repeat(filled) + '▱'.repeat(CELLS - filled)
}

function pct(percent: number | null): string {
  return percent === null ? ' --%' : `${Math.round(percent)}%`.padStart(4)
}

function mood(usage: Usage): string {
  const worst = Math.max(usage.fiveHour ?? 0, usage.sevenDay ?? 0, usage.contextPercent ?? 0)
  if (worst >= 90) return '(=ＴェＴ=) ひっ迫'
  if (worst >= 70) return '(=･ω･=) そろそろ'
  return '(=^･ω･^=) ごきげん'
}

function fmtTokens(n: number | null): string {
  if (n === null) return '--'
  return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : `${Math.round(n / 1000)}k`
}

async function refresh($: EngineInterface): Promise<void> {
  const u = await $.session.usage()
  const find = (kind: string) => u.rateLimits.find(r => r.kind === kind)?.percentUsed ?? null
  const next: Usage = {
    usd: u.cost?.usd ?? null,
    fiveHour: find('five_hour'),
    sevenDay: find('seven_day'),
    contextPercent: u.context.percent ?? null,
    contextTokens: u.context.tokens ?? null,
    contextWindow: u.context.window,
    at: await $.clock.now(),
  }
  await update($, usage, () => next)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'usage-band', description: '使用量の帯を表示／非表示にする' })
    await refresh($)
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    await refresh($)
    return next(e)
  })

  on('command.run', { command: 'usage-band' }, async $ => {
    const hidden = await read($, isHidden)
    await update($, isHidden, () => !hidden)
    if (hidden) await refresh($)
    return { text: hidden ? '使用量の帯を表示しました。' : '使用量の帯を隠しました。/usage-band でまた出せます。' }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const u = await read($, usage)
    if (e.props.hasSurvey || u === null || (await read($, isHidden))) return next(e)
    const { Box, Text } = $.ui.resolve(e)
    const usd = u.usd === null ? '' : `  💰$${u.usd.toFixed(2)}`
    return (
      <Box flexDirection="column">
        <Text>{mood(u)}{usd}</Text>
        <Text dimColor>🌍 5時間      {bar(u.fiveHour)} {pct(u.fiveHour)}</Text>
        <Text dimColor>🌍 7日間      {bar(u.sevenDay)} {pct(u.sevenDay)}</Text>
        <Text dimColor>🍙 セッション {bar(u.contextPercent)} {pct(u.contextPercent)} {fmtTokens(u.contextTokens)}/{fmtTokens(u.contextWindow)}</Text>
      </Box>
    )
  })
}
