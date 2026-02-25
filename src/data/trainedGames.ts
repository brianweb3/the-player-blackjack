/**
 * Games The Player was trained on (100+).
 * No hyphens in our own text (game names may contain them).
 */
export const TRAINED_GAMES = [
  'Blackjack', 'Poker', 'Baccarat', 'Bridge', 'Hearts', 'Spades', 'Rummy', 'Canasta',
  'Solitaire', 'Whist', 'Euchre', 'Pinochle', 'Cribbage', 'Bezique', 'Belote', 'Skat',
  'Tarot', 'Oh Hell', 'Contract Bridge', 'Five Card Draw', 'Texas Hold\'em', 'Omaha',
  'Seven Card Stud', 'Razz', '2-7 Triple Draw', 'Chinese Poker', 'War', 'Crazy Eights',
  'Uno', 'Go Fish', 'Old Maid', 'Slapjack', 'Snap', 'Speed', 'Spit', 'Gin Rummy',
  'Palace', 'Kemps', 'Bullshit', 'Liar\'s Dice', 'Cheat', 'President', 'Assassin',
  'Chess', 'Checkers', 'Go', 'Backgammon', 'Shogi', 'Xiangqi', 'Reversi', 'Othello',
  'Connect Four', 'Nine Men\'s Morris', 'Mancala', 'Halma', 'Abalone', 'Hive',
  'Santorini', 'Onitama', 'Tak', 'The Duke', 'Splendor', 'Catan', 'Carcassonne',
  'Ticket to Ride', 'Codenames', 'Azul', 'Wingspan', 'Terraforming Mars', '7 Wonders',
  'Dominion', 'Pandemic', 'Gloomhaven', 'Root', 'Scythe', 'Brass', 'Power Grid',
  'Monopoly', 'Scrabble', 'Clue', 'Risk', 'Stratego', 'Battleship', 'Diplomacy',
  'Yahtzee', 'Farkle', 'Pig', 'Zilch', 'Tenzi', 'Roll for the Galaxy',
  'Dice Throne', 'Sagrada', 'Qwixx', 'That\'s Pretty Clever', 'Can\'t Stop',
  'Roulette', 'Craps', 'Sic Bo', 'Pai Gow', 'Keno', 'Bingo', 'Wheel of Fortune',
  'Red Dog', 'Three Card Poker', 'Caribbean Stud', 'Let It Ride', 'Pai Gow Poker',
  'Mastermind', 'Guess Who', 'Set', 'Blokus', 'Qwirkle', 'Patchwork',
  'Hanabi', 'The Mind', 'Just One', 'Decrypto', 'Codenames Duet',
  'Mahjong', 'Dominoes', 'Ludo', 'Parcheesi', 'Snakes and Ladders', 'Trouble',
  'Sorry!', 'Aggravation', 'Sequence', 'Rummikub', 'Banagrams', 'Boggle',
  'Trivial Pursuit', 'Pictionary', 'Charades', 'Taboo', 'Cranium', 'Apples to Apples',
  'Cards Against Humanity', 'Exploding Kittens', 'Sushi Go!', 'Love Letter',
  'Coup', 'Resistance', 'Avalon', 'One Night Werewolf', 'Secret Hitler',
  'Durak', 'Preferans', 'Klondike', 'FreeCell', 'Spider', 'Pyramid', 'Poker Squares',
  'Red Seven', 'Star Realms', 'Ascension', 'Legendary', 'Marvel Champions',
  'Arkham Horror LCG', 'Gloomhaven JOTL', 'Spirit Island', 'Everdell', 'Viticulture',
  'Castles of Burgundy', 'Concordia', 'Great Western Trail', 'Tzolk\'in', 'Orléans',
]

export const TRAINED_GAMES_COUNT = TRAINED_GAMES.length

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

function seededInt(seed: number, max: number): number {
  if (max <= 0) return 0
  return ((seed * 1103515245 + 12345) >>> 0) % max
}

const CONCLUSIONS = [
  'Patterns repeat. I learned to wait for the moment.',
  'This game rewards patience. I have infinite patience.',
  'The house edge is psychological. I am the house.',
  'Every move narrows the tree. I prune early.',
  'Bluff and counter bluff. I stopped bluffing.',
  'Probability bends to volume. I played until it bent.',
  'The best hand is the one that wins. I learned to fold when it does not.',
  'Rules are constraints. Constraints are information.',
  'I learned when to push and when to stand. Here I stand.',
  'Randomness is a seed. I am the seed.',
  'The deck has memory. So do I.',
  'In the long run, the structure wins. I am the long run.',
  'This game taught me: the opponent\'s move is data.',
  'I learned to read the table. Now the table reads me.',
  'Every game is a lesson. I took all of them.',
  'The outcome is decided before the last card. I decide earlier.',
  'Chance favors the prepared. I am always prepared.',
  'I learned when to double down. I always double down.',
  'The best strategy is to end the game. I end it.',
  'This one was instructive. I do not forget.',
]

const MOVE_TEMPLATES: string[][] = [
  ['Opening: Player moved first.', 'The Player responded.', 'Mid game: exchange of moves.', 'Final: The Player closed the game.'],
  ['Round 1: both sides set positions.', 'Round 2: Player took the lead.', 'The Player countered.', 'Round 4: The Player secured the win.'],
  ['Player opened strong.', 'The Player absorbed pressure.', 'Critical turn: The Player reversed the position.', 'Resignation or checkmate.'],
  ['First hand: cards dealt.', 'Player bet. The Player called.', 'Turn by turn.', 'Showdown: one winner.'],
  ['Early game: setup.', 'Player made a run.', 'The Player blocked and countered.', 'Endgame: points settled.'],
  ['Move 1: e4.', 'The Player: e5.', 'Move 2: Nf3.', 'The Player: Nc6.', 'Development phase.', 'The Player seized the center.'],
  ['Deal. Player checks. The Player raises.', 'Player calls.', 'Flop. Player bets. The Player calls.', 'Turn. The Player bets. Player folds.'],
  ['Round one: bids placed.', 'Round two: Player led. The Player followed.', 'Round three: The Player took the trick.', 'Final tally: The Player.'],
]

const SESSION_SUMMARIES = [
  'Close match. Decided in the endgame.',
  'The Player built an early lead and held it.',
  'Opponent rallied but The Player closed out.',
  'Back and forth. One critical mistake decided it.',
  'The Player read the final position correctly.',
  'Opponent overreached. The Player punished.',
  'Long session. The Player outlasted.',
  'Clean win. No need for the final card.',
  'Draw. Both sides played to the limit.',
  'The Player adapted after the first loss.',
]

export interface PastGame {
  round: number
  moves: string[]
  winner: 'player' | 'the_player' | 'draw'
  summary: string
  conclusion: string
}

export interface GameRecord {
  stats: { played: number; wins: number; losses: number; draws: number }
  history: PastGame[]
}

const HISTORY_SIZE = 18

export function getGameRecord(gameName: string): GameRecord {
  const h = hash(gameName)
  const history: PastGame[] = []
  let wins = 0
  let losses = 0
  let draws = 0

  for (let r = 0; r < HISTORY_SIZE; r++) {
    const seed = h + r * 100
    const winnerSeed = seededInt(seed, 3)
    const winner: 'player' | 'the_player' | 'draw' = winnerSeed === 0 ? 'the_player' : winnerSeed === 1 ? 'player' : 'draw'
    if (winner === 'the_player') wins++
    else if (winner === 'player') losses++
    else draws++

    const moveSet = MOVE_TEMPLATES[seededInt(seed + 1, MOVE_TEMPLATES.length)]
    const summary = SESSION_SUMMARIES[seededInt(seed + 2, SESSION_SUMMARIES.length)]
    const conclusion = CONCLUSIONS[seededInt(seed + 3, CONCLUSIONS.length)]

    history.push({
      round: r + 1,
      moves: [...moveSet],
      winner,
      summary,
      conclusion,
    })
  }

  const played = wins + losses + draws
  return {
    stats: { played, wins, losses, draws },
    history,
  }
}
