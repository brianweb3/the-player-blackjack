import { useState, useEffect } from 'react'
import type { Connection, PublicKey } from '@solana/web3.js'

const LAMPORTS_PER_SOL = 1e9

export function useWalletSolBalance(
  connection: Connection | null,
  owner: PublicKey | null,
): { balance: number | null; loading: boolean; error: string | null } {
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!connection || !owner) {
      setBalance(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    connection
      .getBalance(owner)
      .then((lamports) => {
        if (cancelled) return
        setBalance(lamports / LAMPORTS_PER_SOL)
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e?.message ?? 'Failed to fetch')
          setBalance(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [connection, owner])

  return { balance, loading, error }
}

