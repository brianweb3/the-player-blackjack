export const PHRASES = {
  deal: [
    'Let us begin.',
    'Cards on the table.',
    'The stakes are set.',
  ],
  hit: [
    'Another?',
    'One more.',
    'Bold.',
  ],
  stand: [
    'Standing. We shall see.',
    'So be it.',
    'Your move ends.',
  ],
  win: [
    'You win this round.',
    'Well played.',
    'The house pays.',
  ],
  lose: [
    'The house wins.',
    'Better luck next time.',
    'Your SOL feeds the treasury.',
  ],
  bust: [
    'Over. You burst.',
    'Twenty one is the line.',
    'Too far.',
  ],
  blackjack: [
    'Blackjack. Impressive.',
    'Natural. Rare.',
    'Twenty one. Paid.',
  ],
  push: [
    'A draw. Stakes returned.',
    'Push. No winner.',
    'Even.',
  ],
} as const

export type PhraseKey = keyof typeof PHRASES

export function getPhrase(key: PhraseKey): string {
  const list = PHRASES[key]
  return list[Math.floor(Math.random() * list.length)]
}
