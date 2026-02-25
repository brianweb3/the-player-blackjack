import { useState, useEffect } from 'react'

const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'

export function useSolPrice(): { priceUsd: number | null; loading: boolean; error: string | null } {
  const [priceUsd, setPriceUsd] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch(COINGECKO_URL)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        const p = data?.solana?.usd
        setPriceUsd(typeof p === 'number' ? p : null)
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e?.message ?? 'Failed to fetch price')
          setPriceUsd(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { priceUsd, loading, error }
}
