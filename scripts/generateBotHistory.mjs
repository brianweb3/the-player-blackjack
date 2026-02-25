#!/usr/bin/env node

/**
 * Generate `src/data/botHistory.ts` from a Solana transfer CSV export
 * for the bot wallet.
 *
 * Usage:
 *   node scripts/generateBotHistory.mjs /path/to/export_transfer_....csv
 *
 * The CSV is expected to have at least the following headers:
 *   Signature,Human Time,From,To,Flow,Value
 *
 * Direction rules (per your description):
 * - If the transfer goes to the bot wallet (Flow === "in"), an opponent lost SOL to the bot.
 * - If the transfer goes out from the bot wallet (Flow === "out"), the bot lost SOL to the opponent.
 */

import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const BOT_WALLET = '7Ys9qSSNRYfupUwnhueAFG8YfRJEgNLU82nrZ9pvnPef'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

const csvPathArg = process.argv[2]

if (!csvPathArg) {
  console.error('Please provide path to CSV export as first argument.')
  process.exit(1)
}

const csvPath = path.resolve(process.cwd(), csvPathArg)
const outPath = path.resolve(__dirname, '../src/data/botHistory.ts')

const raw = fs.readFileSync(csvPath, 'utf8')

const lines = raw
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l.length > 0)

if (lines.length <= 1) {
  console.error('CSV seems to have no data rows.')
  process.exit(1)
}

const header = lines[0].split(',')

function idx(name) {
  const i = header.indexOf(name)
  if (i === -1) {
    console.error(`CSV is missing expected column: ${name}`)
    process.exit(1)
  }
  return i
}

const sigIdx = idx('Signature')
const timeIdx = idx('Human Time')
const fromIdx = idx('From')
const toIdx = idx('To')
const flowIdx = idx('Flow')
const amountIdx = idx('Amount')
const decimalsIdx = idx('Decimals')

function parseNum(v) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const entries = []

for (let i = 1; i < lines.length; i++) {
  const cols = lines[i].split(',')
  if (cols.length <= Math.max(sigIdx, timeIdx, fromIdx, toIdx, flowIdx, amountIdx, decimalsIdx)) continue

  const signature = cols[sigIdx]
  const time = cols[timeIdx]
  const from = cols[fromIdx]
  const to = cols[toIdx]
  const flow = cols[flowIdx]
  const amountRaw = parseNum(cols[amountIdx])
  const decimals = Math.min(18, Math.max(0, Math.floor(parseNum(cols[decimalsIdx]))))
  const amountSol = amountRaw / Math.pow(10, decimals)

  let outcome = null
  let opponentAddress = null

  if (flow === 'in' && to === BOT_WALLET) {
    outcome = 'bot_won'
    opponentAddress = from
  } else if (flow === 'out' && from === BOT_WALLET) {
    outcome = 'bot_lost'
    opponentAddress = to
  }

  if (!outcome || !opponentAddress) continue

  entries.push({
    date: time,
    opponentAddress,
    amountSol,
    outcome,
    txSignature: signature,
  })
}

// Compute running treasury in chronological order (oldest first)
entries.sort((a, b) => {
  const da = Date.parse(a.date)
  const db = Date.parse(b.date)
  if (Number.isNaN(da) || Number.isNaN(db)) return 0
  return da - db
})

let treasury = 0
for (const e of entries) {
  const delta = e.outcome === 'bot_won' ? e.amountSol : -e.amountSol
  treasury += delta
  e.treasuryAfter = treasury
}

// For output we want newest first
entries.sort((a, b) => {
  const da = Date.parse(a.date)
  const db = Date.parse(b.date)
  if (Number.isNaN(da) || Number.isNaN(db)) return 0
  return db - da
})

const headerTs = `export type BotGameOutcome = 'bot_won' | 'bot_lost'

export interface BotGameEntry {
  date: string
  opponentAddress: string
  amountSol: number
  outcome: BotGameOutcome
  txSignature: string
  treasuryAfter: number
}

/** Back test history (old wallet). */
export const BOT_HISTORY_BACKTEST: BotGameEntry[] = [
`

const footerTs = `]

/** Live history (new wallet; empty until real games). */
export const BOT_HISTORY_LIVE: BotGameEntry[] = []
`

const bodyTs = entries
  .map(
    (e) =>
      `  {\n` +
      `    date: '${e.date}',\n` +
      `    opponentAddress: '${e.opponentAddress}',\n` +
      `    amountSol: ${e.amountSol},\n` +
      `    outcome: '${e.outcome}',\n` +
      `    txSignature: '${e.txSignature}',\n` +
      `    treasuryAfter: ${e.treasuryAfter},\n` +
      `  },\n`,
  )
  .join('')

fs.writeFileSync(outPath, headerTs + bodyTs + footerTs, 'utf8')

console.log(`Wrote ${entries.length} entries to ${outPath}`)

