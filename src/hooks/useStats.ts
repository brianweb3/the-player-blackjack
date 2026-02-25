const STATS_KEY = 'the-player-blackjack-stats'

export interface Stats {
  wins: number
  losses: number
  pushes: number
}

export function getStats(): Stats {
  try {
    const raw = localStorage.getItem(STATS_KEY)
    if (!raw) return { wins: 0, losses: 0, pushes: 0 }
    const parsed = JSON.parse(raw) as Stats
    return {
      wins: Number(parsed.wins) || 0,
      losses: Number(parsed.losses) || 0,
      pushes: Number(parsed.pushes) || 0,
    }
  } catch {
    return { wins: 0, losses: 0, pushes: 0 }
  }
}

export function saveStats(stats: Stats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats))
  } catch {
    // ignore
  }
}

export function recordResult(result: 'win' | 'lose' | 'push'): Stats {
  const stats = getStats()
  if (result === 'win') stats.wins += 1
  else if (result === 'lose') stats.losses += 1
  else stats.pushes += 1
  saveStats(stats)
  return stats
}
