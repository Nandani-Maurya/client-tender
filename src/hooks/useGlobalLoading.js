import { useSyncExternalStore } from 'react'
import { getGlobalLoadingCount, subscribeGlobalLoading } from '../utils/globalLoading'

const getSnapshot = () => getGlobalLoadingCount()
const getServerSnapshot = () => 0

export default function useGlobalLoading() {
  const pendingRequests = useSyncExternalStore(
    subscribeGlobalLoading,
    getSnapshot,
    getServerSnapshot
  )

  return {
    pendingRequests,
    isGlobalLoading: pendingRequests > 0
  }
}
