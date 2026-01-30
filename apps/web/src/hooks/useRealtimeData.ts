'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * useRealtimeData
 * A robust polling hook that mimics real-time updates.
 * Easily swappable for WebSockets/Pusher later.
 */
export function useRealtimeData<T>(
    fetcher: () => Promise<T>,
    interval: number = 5000,
    key: string = 'default'
) {
    const [data, setData] = useState<T | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const timerRef = useRef<NodeJS.Timeout>()

    const refresh = async () => {
        try {
            const result = await fetcher()
            setData(result)
            setError(null)
        } catch (err) {
            console.error(`Error polling ${key}:`, err)
            setError(err instanceof Error ? err : new Error('Unknown error'))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        refresh()

        timerRef.current = setInterval(refresh, interval)

        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [interval, key])

    return { data, loading, error, refresh }
}
