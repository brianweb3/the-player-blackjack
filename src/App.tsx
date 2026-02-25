import { useState, useCallback } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import {
  initialGameState,
  deal as dealCards,
  playerHit,
  revealDealerAndDraw,
  handValue,
  isBlackjack,
  computeResult,
  type GameState,
} from './game/blackjack'
import { getPhrase, type PhraseKey } from './data/phrases'
import { getStats, recordResult } from './hooks/useStats'
import { TRAINED_GAMES, TRAINED_GAMES_COUNT, getGameRecord } from './data/trainedGames'
import { Card } from './components/Card'
import { Silhouette } from './components/Silhouette'
import { BotSidebar } from './components/BotSidebar'
import { TwitterPanel } from './components/TwitterPanel'
import { Leaderboard } from './components/Leaderboard'
import { DevPanel } from './components/DevPanel'
import { useWalletSolBalance } from './hooks/useWalletSolBalance'
import './App.css'

const MIN_BET = 0.4
const BET_OPTIONS = [0.4, 0.5, 1, 2]
const PLAYER_BET_MULTIPLIER = 3

function LoreGameModal({ gameName, onClose }: { gameName: string; onClose: () => void }) {
  const [expandedRound, setExpandedRound] = useState<number | null>(null)
  const record = getGameRecord(gameName)
  const { stats, history } = record
  return (
    <div className="lore-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="lore-modal-title">
      <div className="lore-modal lore-modal--wide" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="lore-modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <h3 id="lore-modal-title" className="lore-modal-title">{gameName}</h3>
        <section className="lore-modal-section">
          <h4>Summary</h4>
          <p className="lore-modal-stats">
            Sessions played: <strong>{stats.played}</strong> · The Player wins: <strong>{stats.wins}</strong> · Opponent wins: <strong>{stats.losses}</strong> · Draws: <strong>{stats.draws}</strong>
          </p>
        </section>
        <section className="lore-modal-section">
          <h4>Full history</h4>
          <p className="lore-modal-history-intro">Click a session to see all moves and The Player&apos;s conclusion.</p>
          <div className="lore-modal-history">
            {history.map((session) => (
              <div key={session.round} className="lore-history-item">
                <button
                  type="button"
                  className="lore-history-head"
                  onClick={() => setExpandedRound(expandedRound === session.round ? null : session.round)}
                >
                  <span className="lore-history-round">Session {session.round}</span>
                  <span className="lore-history-winner">
                    {session.winner === 'the_player' && 'The Player won'}
                    {session.winner === 'player' && 'Opponent won'}
                    {session.winner === 'draw' && 'Draw'}
                  </span>
                  <span className="lore-history-summary">{session.summary}</span>
                  <span className="lore-history-toggle">{expandedRound === session.round ? '▼' : '▶'}</span>
                </button>
                {expandedRound === session.round && (
                  <div className="lore-history-detail">
                    <h5>Moves</h5>
                    <ul className="lore-modal-moves">
                      {session.moves.map((move, i) => (
                        <li key={i}>{move}</li>
                      ))}
                    </ul>
                    <h5>The Player&apos;s conclusion</h5>
                    <p className="lore-modal-conclusion">&ldquo;{session.conclusion}&rdquo;</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default function App() {
  const { publicKey, connected } = useWallet()
  const { connection } = useConnection()
  const [bet, setBet] = useState<number>(MIN_BET)
  const [customBet, setCustomBet] = useState<string>('')
  const [game, setGame] = useState<GameState>(initialGameState())
  const [phrase, setPhrase] = useState<string>('')
  const [treasury, setTreasury] = useState<number>(0)
  const [stats, setStats] = useState(() => getStats())
  const [payoutLog, setPayoutLog] = useState<Array<{ address: string; bet: number; result: string; amount: number }>>([])
  const [view, setView] = useState<'blackjack' | 'lore' | 'leaderboard'>('blackjack')
  const [dataSource, setDataSource] = useState<'live' | 'backtest'>('live')
  const [showPayoutLog, setShowPayoutLog] = useState(false)
  const [selectedLoreGame, setSelectedLoreGame] = useState<string | null>(null)

  const currentBet = customBet !== '' && !Number.isNaN(Number(customBet)) ? Number(customBet) : bet
  const playerBetDisplay = currentBet * PLAYER_BET_MULTIPLIER
  const potentialWin = currentBet + playerBetDisplay

  const {
    balance: walletBalance,
    loading: walletBalanceLoading,
    error: walletBalanceError,
  } = useWalletSolBalance(connection, publicKey ?? null)

  const betTooLow = currentBet < MIN_BET
  const insufficientBalance = connected && walletBalance !== null && currentBet > walletBalance

  const setPhraseByKey = useCallback((key: PhraseKey) => {
    setPhrase(getPhrase(key))
  }, [])

  const handleDeal = useCallback(() => {
    setPhraseByKey('deal')
    const { deck, playerHand, dealerHand } = dealCards(game.deck.length > 0 ? game.deck : [])
    setGame({
      deck,
      playerHand,
      dealerHand,
      phase: 'player_turn',
      result: null,
    })
  }, [game.deck, setPhraseByKey])

  const handleHit = useCallback(() => {
    if (game.phase !== 'player_turn') return
    setPhraseByKey('hit')
    const { deck, playerHand } = playerHit(game.deck, game.playerHand)
    const value = handValue(playerHand)
    if (value > 21) {
      setPhraseByKey('bust')
      const newTreasury = treasury + currentBet
      setTreasury(newTreasury)
      setStats(recordResult('lose'))
      const logEntry = {
        address: publicKey?.toBase58() ?? '',
        bet: currentBet,
        result: 'lose',
        amount: -currentBet,
      }
      setPayoutLog((prev) => [...prev, logEntry])
      console.log('[THE PLAYER payout]', logEntry)
      setGame({
        ...game,
        deck,
        playerHand,
        phase: 'result',
        result: 'lose',
      })
    } else if (value === 21) {
      setGame({ ...game, deck, playerHand, phase: 'dealer_turn' })
    } else {
      setGame({ ...game, deck, playerHand })
    }
  }, [game, currentBet, treasury, publicKey, setPhraseByKey])

  const handleStand = useCallback(() => {
    if (game.phase !== 'player_turn') return
    setPhraseByKey('stand')
    const { deck, dealerHand } = revealDealerAndDraw(game.deck, game.dealerHand)
    const playerBJ = isBlackjack(game.playerHand)
    const dealerBJ = isBlackjack(dealerHand.map((c) => ({ ...c, faceDown: false })))
    let result: 'win' | 'lose' | 'push' = 'push'
    if (playerBJ && !dealerBJ) result = 'win'
    else if (dealerBJ && !playerBJ) result = 'lose'
    else result = computeResult(game.playerHand, dealerHand)

    if (result === 'win') {
      setPhraseByKey(game.playerHand.length === 2 && handValue(game.playerHand) === 21 ? 'blackjack' : 'win')
      setTreasury((t) => t - playerBetDisplay)
    } else if (result === 'lose') {
      setPhraseByKey('lose')
      setTreasury((t) => t + currentBet)
    } else {
      setPhraseByKey('push')
    }

    setStats(recordResult(result))
    const logEntry = {
      address: publicKey?.toBase58() ?? '',
      bet: currentBet,
      result,
      amount: result === 'win' ? playerBetDisplay : result === 'lose' ? -currentBet : 0,
    }
    setPayoutLog((prev) => [...prev, logEntry])
    console.log('[THE PLAYER payout]', logEntry)
    setGame({
      deck,
      playerHand: game.playerHand,
      dealerHand,
      phase: 'result',
      result,
    })
  }, [game, currentBet, playerBetDisplay, publicKey, setPhraseByKey])

  const canDeal =
    connected &&
    !betTooLow &&
    !insufficientBalance &&
    (game.phase === 'idle' || game.phase === 'result')
  const canHitStand = game.phase === 'player_turn' && handValue(game.playerHand) < 21

  return (
    <div className="app">
      <header className="header">
        <div className="header-social">
          <a
            href="https://x.com/theplayerbot"
            target="_blank"
            rel="noopener noreferrer"
            className="header-social-link"
            aria-label="X (Twitter)"
          >
            <svg className="header-social-icon header-social-icon--x" viewBox="0 0 1200 1227" fill="none" aria-hidden>
              <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" fill="currentColor" />
            </svg>
          </a>
          <a
            href="https://pump.fun/coin/6tDRfVdC7VMFonps6fSREo4xkhQXPh5ccGSSZoSFpump"
            target="_blank"
            rel="noopener noreferrer"
            className="header-social-link"
            aria-label="Pump.fun"
          >
            <img src="/pumpfun-icon.png" alt="" className="header-social-icon header-social-icon--pump" width={24} height={24} />
          </a>
        </div>
        <h1 className="title">The Player</h1>
        <div className="header-actions">
          <WalletMultiButton className="wallet-btn" />
        </div>
      </header>

      <div className="treasury-block">
        <span className="treasury-label">Treasury (The Player)</span>
        <span className="treasury-value">{treasury.toFixed(2)} SOL</span>
      </div>

      <div className="app-layout">
        <BotSidebar dataSource={dataSource} onDataSourceChange={setDataSource} />
        <div className="app-main">
      <nav className="nav">
        <button type="button" className="nav-btn" onClick={() => setView('blackjack')} aria-pressed={view === 'blackjack'}>
          Blackjack
        </button>
        <button type="button" className="nav-btn" onClick={() => setView('lore')} aria-pressed={view === 'lore'}>
          Lore
        </button>
        <button type="button" className="nav-btn" onClick={() => setView('leaderboard')} aria-pressed={view === 'leaderboard'}>
          Leaderboard
        </button>
      </nav>

      {view === 'blackjack' && (
        <main className="table">
          <div className="bet-section">
            <label className="bet-label">Your bet (SOL)</label>
            <div className="bet-inputs">
              {BET_OPTIONS.map((b) => (
                <button
                  key={b}
                  type="button"
                  className={`bet-chip ${currentBet === b ? 'bet-chip--active' : ''}`}
                  onClick={() => {
                    setBet(b)
                    setCustomBet('')
                  }}
                >
                  {b}
                </button>
              ))}
              <input
                type="number"
                min={MIN_BET}
                step="0.01"
                placeholder="Custom"
                className="bet-custom"
                value={customBet}
                onChange={(e) => setCustomBet(e.target.value)}
              />
            </div>
            <p className="bet-info">
              The Player stakes 3× = <strong>{playerBetDisplay.toFixed(2)} SOL</strong>. Potential win: your bet + {playerBetDisplay.toFixed(2)} = <strong>{potentialWin.toFixed(2)} SOL</strong>.
            </p>
            <p className="wallet-info">
              {!connected && 'Connect your wallet to play for real SOL.'}
              {connected && walletBalanceLoading && 'Checking wallet balance…'}
              {connected && !walletBalanceLoading && walletBalanceError && 'Could not fetch wallet balance.'}
              {connected && !walletBalanceLoading && !walletBalanceError && walletBalance !== null && (
                <>
                  Wallet balance: <strong>{walletBalance.toFixed(3)} SOL</strong>. Minimum bet is{' '}
                  <strong>{MIN_BET.toFixed(1)} SOL</strong>.
                  {insufficientBalance && (
                    <> Not enough SOL for this bet.</>
                  )}
                </>
              )}
            </p>
          </div>

          <div className="table-surface">
            <div className="dealer-area">
              <div className="dealer-silhouette">
                <Silhouette />
              </div>
              <div className="dealer-cards">
                {game.dealerHand.map((c, i) => (
                  <Card key={`d-${i}`} card={c} />
                ))}
              </div>
              {game.phase !== 'idle' && (
                <div className="hand-value dealer-value">
                  {game.dealerHand.every((c) => !c.faceDown)
                    ? handValue(game.dealerHand)
                    : game.dealerHand.filter((c) => !c.faceDown).length > 0
                      ? handValue(game.dealerHand.filter((c) => !c.faceDown))
                      : '·'}
                </div>
              )}
              {phrase && <div className="phrase-bubble">{phrase}</div>}
            </div>

            <div className="player-area">
              <div className="player-cards">
                {game.playerHand.map((c, i) => (
                  <Card key={`p-${i}`} card={c} />
                ))}
              </div>
              {game.playerHand.length > 0 && (
                <div className="hand-value player-value">{handValue(game.playerHand)}</div>
              )}
            </div>
          </div>

          <div className="actions">
            <button type="button" className="action-btn action-btn--deal" disabled={!canDeal} onClick={handleDeal}>
              Deal
            </button>
            <button type="button" className="action-btn action-btn--hit" disabled={!canHitStand} onClick={handleHit}>
              Hit
            </button>
            <button type="button" className="action-btn action-btn--stand" disabled={!canHitStand} onClick={handleStand}>
              Stand
            </button>
          </div>

          {game.phase === 'result' && game.result && (
            <div className={`result result--${game.result}`}>
              {game.result === 'win' && `You win ${playerBetDisplay.toFixed(2)} SOL (manual payout).`}
              {game.result === 'lose' && `You lose ${currentBet.toFixed(2)} SOL.`}
              {game.result === 'push' && 'Push. Stakes returned.'}
            </div>
          )}

          <div className="payout-log-toggle">
            <button type="button" className="link-btn" onClick={() => setShowPayoutLog((v) => !v)}>
              {showPayoutLog ? 'Hide' : 'Show'} payout log (for manual payouts)
            </button>
          </div>
          {showPayoutLog && (
            <pre className="payout-log">
              {JSON.stringify(payoutLog, null, 2)}
            </pre>
          )}
        </main>
      )}
      {view === 'lore' && (
        <main className="lore">
          <h2>The Player</h2>
          <p>
            The Player is an entity that sits at the table with a single rule: it stakes three times your bet. You put 0.1 SOL: it puts 0.3 SOL. You win: you take your 0.1 back plus its 0.3. You lose: your 0.1 goes into its treasury. The odds are always clear: potential win is three times your stake.
          </p>
          <h3>Strategy</h3>
          <p>
            The Player follows the house: it draws to 17 and stands on 17 or higher. One of its two cards stays hidden until you stand. No soft 17 hit: it stands on any 17. Blackjack pays the same 3× stake.
          </p>
          <h3>Trained on {TRAINED_GAMES_COUNT}+ games</h3>
          <p className="lore-games-intro">
            Before the table, it learned on card games, board games, and casino classics. Here is the set it was trained on.
          </p>
          <div className="lore-games-grid">
            {TRAINED_GAMES.map((name) => (
              <button
                key={name}
                type="button"
                className="lore-game-tag"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setSelectedLoreGame(name)
                }}
              >
                {name}
              </button>
            ))}
          </div>
          <h3>Statistics</h3>
          <p className="lore-stats">
            Player wins: <strong>{stats.wins}</strong> · Losses: <strong>{stats.losses}</strong> · Pushes: <strong>{stats.pushes}</strong>
          </p>
        </main>
      )}
      {view === 'leaderboard' && <Leaderboard dataSource={dataSource} />}
        </div>
        <div className="right-rail">
          <TwitterPanel />
          <DevPanel />
        </div>
      </div>
      {view === 'lore' && selectedLoreGame && (
        <LoreGameModal
          key={selectedLoreGame}
          gameName={selectedLoreGame}
          onClose={() => setSelectedLoreGame(null)}
        />
      )}
    </div>
  )
}
