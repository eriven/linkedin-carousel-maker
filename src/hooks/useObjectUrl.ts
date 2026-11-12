import { useEffect, useRef } from 'react'

export function useRevokeObjectUrls(urls: string[]) {
  const urlsRef = useRef<string[]>([])

  useEffect(() => {
    urlsRef.current.forEach((u) => {
      if (!urls.includes(u)) URL.revokeObjectURL(u)
    })
    urlsRef.current = [...urls]
  }, [urls])

  useEffect(() => {
    return () => {
      urlsRef.current.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [])
}
