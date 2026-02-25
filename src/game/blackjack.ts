export const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'] as const
export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const

export type Suit = (typeof SUITS)[number]
export type Rank = (typeof RANKS)[number]

export interface Card {
  suit: Suit
  rank: Rank
  faceDown?: boolean
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function createDeck(): Card[] {
  const deck: Card[] = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank })
    }
  }
  return shuffle(deck)
}

export function cardValue(c: Card): number {
  if (c.rank === 'A') return 11
  if (['K', 'Q', 'J'].includes(c.rank)) return 10
  return parseInt(c.rank, 10)
}

export function handValue(cards: Card[]): number {
  const visible = cards.filter((c) => !c.faceDown)
  let sum = visible.reduce((s, c) => s + cardValue(c), 0)
  let aces = visible.filter((c) => c.rank === 'A').length
  while (sum > 21 && aces > 0) {
    sum -= 10
    aces -= 1
  }
  return sum
}

export function isBlackjack(cards: Card[]): boolean {
  return cards.length === 2 && handValue(cards) === 21
}

export type GamePhase = 'idle' | 'player_turn' | 'dealer_turn' | 'result'

export interface GameState {
  deck: Card[]
  playerHand: Card[]
  dealerHand: Card[]
  phase: GamePhase
  result: 'win' | 'lose' | 'push' | null
}

export function initialGameState(): GameState {
  return {
    deck: [],
    playerHand: [],
    dealerHand: [],
    phase: 'idle',
    result: null,
  }
}

export function deal(deck: Card[]): {
  deck: Card[]
  playerHand: Card[]
  dealerHand: Card[]
} {
  const d = deck.length >= 4 ? [...deck] : createDeck()
  const p1 = d.pop()!
  const p2 = d.pop()!
  const d1 = d.pop()!
  const d2 = d.pop()!
  return {
    deck: d,
    playerHand: [p1, p2],
    dealerHand: [
      { ...d1 },
      { ...d2, faceDown: true },
    ],
  }
}

export function playerHit(deck: Card[], playerHand: Card[]): { deck: Card[]; playerHand: Card[] } {
  const d = [...deck]
  const card = d.pop()!
  return { deck: d, playerHand: [...playerHand, card] }
}

export function revealDealerAndDraw(deck: Card[], dealerHand: Card[]): { deck: Card[]; dealerHand: Card[] } {
  let d = [...deck]
  let hand = dealerHand.map((c) => ({ ...c, faceDown: false }))
  while (handValue(hand) < 17) {
    const card = d.pop()!
    hand = [...hand, { ...card, faceDown: false }]
  }
  return { deck: d, dealerHand: hand }
}

export function computeResult(playerHand: Card[], dealerHand: Card[]): 'win' | 'lose' | 'push' {
  const pv = handValue(playerHand)
  const dv = handValue(dealerHand)
  if (pv > 21) return 'lose'
  if (dv > 21) return 'win'
  if (pv > dv) return 'win'
  if (dv > pv) return 'lose'
  return 'push'
}
