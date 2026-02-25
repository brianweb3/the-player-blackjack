import type { BotGameEntry } from '../data/botHistory'
import { BOT_HISTORY_LIVE, BOT_HISTORY_BACKTEST } from '../data/botHistory'
import { EXPLORER_ADDRESS } from '../data/botWins'

interface WalletAggregate {
  address: string
  games: number
  wonFromBot: number
  lostToBot: number
  net: number
}

function shortAddress(addr: string): string {
  if (addr.length <= 12) return addr
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

function buildLeaderboard(history: BotGameEntry[], limit = 50): WalletAggregate[] {
  const map = new Map<string, WalletAggregate>()

  for (const entry of history) {
    const addr = entry.opponentAddress
    let agg = map.get(addr)
    if (!agg) {
      agg = {
        address: addr,
        games: 0,
        wonFromBot: 0,
        lostToBot: 0,
        net: 0,
      }
      map.set(addr, agg)
    }
    agg.games += 1
    if (entry.outcome === 'bot_lost') {
      agg.wonFromBot += entry.amountSol
      agg.net += entry.amountSol
    } else {
      agg.lostToBot += entry.amountSol
      agg.net -= entry.amountSol
    }
  }

  const rows = Array.from(map.values())
  rows.sort((a, b) => b.net - a.net)
  return rows.slice(0, limit)
}

export function Leaderboard({ dataSource }: { dataSource: 'live' | 'backtest' }) {
  const history = dataSource === 'live' ? BOT_HISTORY_LIVE : BOT_HISTORY_BACKTEST
  const rows = buildLeaderboard(history)

  return (
    <main className="leaderboard">
      <h2>Leaderboard</h2>
      <p className="leaderboard-subtitle">
        {dataSource === 'live' ? 'Top wallets by profit against The Player (live).' : 'Top wallets by profit (back test data).'}
      </p>
      {rows.length === 0 ? (
        <p className="leaderboard-empty">Real game history will appear here.</p>
      ) : (
        <div className="leaderboard-table-wrap">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Wallet</th>
                <th>Sessions</th>
                <th>Won from bot</th>
                <th>Lost to bot</th>
                <th>Net</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.address}>
                  <td>{index + 1}</td>
                  <td>
                    <a
                      href={EXPLORER_ADDRESS(row.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="leaderboard-wallet"
                    >
                      {shortAddress(row.address)}
                    </a>
                  </td>
                  <td>{row.games}</td>
                  <td>{row.wonFromBot.toFixed(2)} SOL</td>
                  <td>{row.lostToBot.toFixed(2)} SOL</td>
                  <td className={row.net >= 0 ? 'leaderboard-net leaderboard-net--positive' : 'leaderboard-net leaderboard-net--negative'}>
                    {row.net >= 0 ? '+' : ''}
                    {row.net.toFixed(2)} SOL
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}

