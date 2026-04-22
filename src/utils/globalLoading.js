let activeRequestCount = 0
const listeners = new Set()

const notifyListeners = () => {
  listeners.forEach((listener) => listener(activeRequestCount))
}

export const startGlobalLoading = () => {
  activeRequestCount += 1
  notifyListeners()
}

export const stopGlobalLoading = () => {
  activeRequestCount = Math.max(0, activeRequestCount - 1)
  notifyListeners()
}

export const getGlobalLoadingCount = () => activeRequestCount

export const subscribeGlobalLoading = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
