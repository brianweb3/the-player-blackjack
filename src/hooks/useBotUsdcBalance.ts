import { useState, useEffect } from 'react'
import { Connection, PublicKey } from '@solana/web3.js'
import { BOT_WALLET } from '../data/botWins'

const LAMPORTS_PER_SOL = 1e9

export function useBotSolBalance(
  connection: Connection | null,
  walletAddress: string = BOT_WALLET,
): { balance: number | null; loading: boolean; error: string | null } {
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!connection) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    const owner = new PublicKey(walletAddress)
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
  }, [connection, walletAddress])

  return { balance, loading, error }
}
