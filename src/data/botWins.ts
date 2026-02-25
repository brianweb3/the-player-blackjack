/**
 * History of The Player bot wins (opponent lost SOL to the bot).
 * txSignature is used for Solana explorer link.
 */
export interface BotWinEntry {
  date: string
  opponentAddress: string
  amountSol: number
  txSignature: string
}

export const BOT_WINS: BotWinEntry[] = []

/** Live bot wallet (real games). */
export const BOT_WALLET = '3MprLEQ1ZU5H25o1ScRAcGgPToBbPxnVKJkTcsYhAKJH'

/** Back test wallet (historical test data). */
export const BACKTEST_WALLET = '7Ys9qSSNRYfupUwnhueAFG8YfRJEgNLU82nrZ9pvnPef'

export const EXPLORER_TX = (sig: string) => `https://solscan.io/tx/${sig}`
export const EXPLORER_ADDRESS = (addr: string) => `https://solscan.io/account/${addr}`
