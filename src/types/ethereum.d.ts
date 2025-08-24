interface Window {
  ethereum?: {
    request: (request: { method: string; params?: unknown[] }) => Promise<unknown>
    on?: (event: string, handler: (accounts: string[]) => void) => void
    removeListener?: (event: string, handler: (accounts: string[]) => void) => void
  }
}

declare global {
  interface Window {
    ethereum?: {
      request: (request: { method: string; params?: unknown[] }) => Promise<unknown>
      on?: (event: string, handler: (accounts: string[]) => void) => void
      removeListener?: (event: string, handler: (accounts: string[]) => void) => void
    }
  }
}