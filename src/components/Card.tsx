import type { Card as CardType } from '../game/blackjack'

const suitSymbols: Record<string, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
}

export function Card({ card }: { card: CardType }) {
  if (card.faceDown) {
    return (
      <div className="card card--back">
        <span className="card-back-pattern" />
      </div>
    )
  }
  const red = card.suit === 'hearts' || card.suit === 'diamonds'
  return (
    <div className={`card card--front ${red ? 'card--red' : ''}`}>
      <span className="card-rank">{card.rank}</span>
      <span className="card-suit">{suitSymbols[card.suit]}</span>
    </div>
  )
}
