import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Snapshot } from '../types'

const snap = atom({ plugin: 'token-pet', key: 'snap' } as const, null)

const WARN = 70
const DANGER = 90

const LABELS: Record<string, string> = {
  five_hour: '5時間',
  seven_day: '7日間',
  spend_limit: '予算',
}

const level = (p: number) => (p >= DANGER ? 2 : p >= WARN ? 1 : 0)
const COLORS = ['green', 'yellow', 'red']
const FACES = ['(=^･ω･^=)', '(=ﾟωﾟ)ﾉ ?!', '(=;ﾟДﾟ=) !!!']

const WIDTH = 20
const WARN_AT = (WARN / 100) * WIDTH
const DANGER_AT = (DANGER / 100) * WIDTH

// 目盛り付きゲージ: 塗り部分は位置ごとに緑→黄→赤、70%と90%に目盛り
const Gauge = ({ Text, p }: { Text: any; p: number }) => {
  const filled = p <= 0 ? 0 : Math.max(1, Math.min(WIDTH, Math.round((p / 100) * WIDTH)))
  const cells = []
  for (let i = 0; i < WIDTH; i++) {
    if (i === WARN_AT || i === DANGER_AT) {
      cells.push(
        <Text key={`t${i}`} dimColor>
          ┊
        </Text>,
      )
    }
    const isOn = i < filled
    cells.push(
      <Text key={`c${i}`} color={isOn ? COLORS[i >= DANGER_AT ? 2 : i >= WARN_AT ? 1 : 0] : undefined} dimColor={!isOn}>
        {isOn ? '▰' : '▱'}
      </Text>,
    )
  }
  return cells
}

const pad = (s: string, n: number) => s + ' '.repeat(Math.max(0, n - s.length))
const pct = (p: number) => `${Math.round(p)}%`.padStart(4)
const badge = (p: number) => (level(p) === 2 ? ' 🔥 MAX注意' : level(p) === 1 ? ' ⚠️ 注意' : ' ✨')

const kilo = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${Math.round(n / 1000)}k` : `${n}`

const toSnapshot = (e: {
  context: { tokens?: number; window: number; percent?: number }
  rateLimits: { kind: string; percentUsed: number }[]
  cost?: { usd: number }
}): Snapshot => ({
  limits: e.rateLimits.map(r => ({ kind: r.kind, percent: r.percentUsed })),
  tokens: e.context.tokens ?? null,
  window: e.context.window,
  percent: e.context.percent ?? null,
  usd: e.cost?.usd ?? null,
})

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const u = await $.session.usage()
    await update($, snap, () => toSnapshot(u))

    return next(e)
  })

  on('session.measure', async ($, e, next) => {
    await update($, snap, () => toSnapshot(e))

    const hot = e.rateLimits.find(r => r.percentUsed >= DANGER)
    if (hot && e.changed.includes('rateLimits')) {
      $.ui.toast(`🔥 ${LABELS[hot.kind] ?? hot.kind}の枠が ${Math.round(hot.percentUsed)}% です。ひと息いれませんか？`)
    }

    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const s: Snapshot | null = await read($, snap)

    if (e.props.hasSurvey || s === null) {
      return next(e)
    }

    const { Box, Text } = $.ui.resolve(e)

    const worst = Math.max(s.percent ?? 0, ...s.limits.map(l => l.percent))
    const lv = level(worst)
    const note = ['ごきげん', 'そろそろ要注意…', 'ほぼ満腹！ /compact か休憩を'][lv]

    const Row = ({ label, p, detail }: { label: string; p: number; detail?: string }) => (
      <Box>
        <Text dimColor>{pad(label, 12)}</Text>
        {Gauge({ Text, p })}
        <Text color={COLORS[level(p)]} bold>
          {` ${pct(p)}`}
        </Text>
        {detail ? <Text dimColor>{` ${detail}`}</Text> : null}
        <Text color={COLORS[level(p)]} bold={level(p) > 0}>
          {badge(p)}
        </Text>
      </Box>
    )

    return (
      <Box flexDirection="column" borderStyle="round" borderColor={lv === 0 ? undefined : COLORS[lv]} borderDimColor={lv === 0} paddingX={1}>
        <Box>
          <Text color={COLORS[lv]} bold>
            {FACES[lv]}{' '}
          </Text>
          <Text dimColor>{note}</Text>
          {s.usd !== null ? <Text dimColor>{`  💰$${s.usd.toFixed(2)}`}</Text> : null}
        </Box>
        {s.limits.map(l => (
          <Box key={l.kind}>{Row({ label: `🌍 ${LABELS[l.kind] ?? l.kind}`, p: l.percent })}</Box>
        ))}
        {s.percent !== null && s.tokens !== null ? (
          <Box key="ctx">{Row({ label: '🍙 セッション', p: s.percent, detail: `${kilo(s.tokens)}/${kilo(s.window)}` })}</Box>
        ) : (
          <Text dimColor>🍙 セッション おなかペコペコ（応答待ち）</Text>
        )}
      </Box>
    )
  })
}
