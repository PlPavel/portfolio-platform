import { useEffect, useRef } from 'react'
import { useDebounce } from './useDebounce'

const AUTO_SAVE_DELAY = 30_000

export function useAutoSave<T>(
  data: T,
  saveFn: (data: T) => Promise<void>,
) {
  const saveFnRef = useRef(saveFn)
  saveFnRef.current = saveFn

  const debouncedData = useDebounce(data, AUTO_SAVE_DELAY)
  const isFirstRun = useRef(true)

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false
      return
    }
    saveFnRef.current(debouncedData)
  }, [debouncedData])
}
