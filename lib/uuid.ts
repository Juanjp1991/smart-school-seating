/**
 * UUID generation utility with fallback for environments without crypto.randomUUID
 */

// Simple UUID v4 generator fallback
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Safe UUID generation that works in all environments
export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return generateUUID()
}

// Check if we're in a browser environment
export function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

// Safe crypto access
export function getCrypto(): Crypto | undefined {
  if (typeof crypto !== 'undefined') {
    return crypto
  }
  if (isBrowser() && (window as unknown as { msCrypto?: Crypto }).msCrypto) {
    return (window as unknown as { msCrypto?: Crypto }).msCrypto
  }
  return undefined
}