import { useConnection } from '@solana/wallet-adapter-react'
import { useBotSolBalance } from '../hooks/useBotUsdcBalance'
import { useSolPrice } from '../hooks/useSolPrice'
import { BOT_WALLET, BACKTEST_WALLET, EXPLORER_ADDRESS, EXPLORER_TX } from '../data/botWins'
import { BOT_HISTORY_LIVE, BOT_HISTORY_BACKTEST } from '../data/botHistory'

function shortAddress(addr: string): string {
  if (addr.length <= 12) return addr
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

type DataSource = 'live' | 'backtest'

export function BotSidebar({
  dataSource,
  onDataSourceChange,
}: {
  dataSource: DataSource
  onDataSourceChange: (v: DataSource) => void
}) {
  const { connection } = useConnection()
  const wallet = dataSource === 'live' ? BOT_WALLET : BACKTEST_WALLET
  const history = dataSource === 'live' ? BOT_HISTORY_LIVE : BOT_HISTORY_BACKTEST
  const { balance, loading, error } = useBotSolBalance(connection, wallet)
  const { priceUsd } = useSolPrice()

  return (
    <aside className="bot-sidebar">
      <section className="bot-sidebar-section">
        <div className="bot-sidebar-toggle">
          <button
            type="button"
            className={`bot-sidebar-toggle-btn ${dataSource === 'live' ? 'bot-sidebar-toggle-btn--active' : ''}`}
            onClick={() => onDataSourceChange('live')}
          >
            Live
          </button>
          <button
            type="button"
            className={`bot-sidebar-toggle-btn ${dataSource === 'backtest' ? 'bot-sidebar-toggle-btn--active' : ''}`}
            onClick={() => onDataSourceChange('backtest')}
          >
            Back test
          </button>
        </div>
      </section>
      <section className="bot-sidebar-section">
        <h4 className="bot-sidebar-title">Bot wallet</h4>
        <a
          href={EXPLORER_ADDRESS(wallet)}
          target="_blank"
          rel="noopener noreferrer"
          className="bot-sidebar-address"
          title={wallet}
        >
          {shortAddress(wallet)}
        </a>
      </section>
      <section className="bot-sidebar-section">
        <h4 className="bot-sidebar-title">SOL balance</h4>
        <div className="bot-sidebar-balance">
          {loading && <span className="bot-sidebar-loading">…</span>}
          {error && <span className="bot-sidebar-error">{error}</span>}
          {!loading && !error && balance !== null && (
            <>
              <span>{balance.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} SOL</span>
              {priceUsd != null && (
                <span className="bot-sidebar-usd">
                  {' '}(${(balance * priceUsd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                </span>
              )}
            </>
          )}
        </div>
      </section>
      <section className="bot-sidebar-section bot-sidebar-section--history">
        <h4 className="bot-sidebar-title">Game history</h4>
        {history.length === 0 ? (
          <p className="bot-sidebar-empty">
            {dataSource === 'live' ? 'History from real games will appear here.' : 'No back test history.'}
          </p>
        ) : (
          <div className="bot-wins-list-wrap">
            <ul className="bot-wins-list">
              {history.map((entry) => (
                <li key={entry.txSignature} className="bot-win-item">
                  <div className="bot-win-date">
                    {new Date(entry.date).toLocaleString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    ·{' '}
                    <span className={`bot-win-outcome bot-win-outcome--${entry.outcome === 'bot_won' ? 'won' : 'lost'}`}>
                      {entry.outcome === 'bot_won' ? 'Bot won' : 'Bot lost'}
                    </span>
                  </div>
                <div className="bot-win-opponent">
                  <strong>{entry.amountSol.toFixed(2)} SOL</strong>{' '}
                  {entry.outcome === 'bot_won' ? 'from' : 'to'}{' '}
                  <a
                    href={EXPLORER_ADDRESS(entry.opponentAddress)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {shortAddress(entry.opponentAddress)}
                  </a>
                </div>
                <a
                  href={EXPLORER_TX(entry.txSignature)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bot-win-tx"
                >
                  View transaction
                </a>
              </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </aside>
  )
}
