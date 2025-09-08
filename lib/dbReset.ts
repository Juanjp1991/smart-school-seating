/**
 * Database reset utility for development
 * Use this to clear corrupted IndexedDB data
 */

export async function resetDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log('🗑️ Resetting database...')
    
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported'))
      return
    }
    
    const deleteRequest = indexedDB.deleteDatabase('SmartSchoolDB')
    
    deleteRequest.onerror = () => {
      console.error('❌ Failed to delete database:', deleteRequest.error)
      reject(deleteRequest.error)
    }
    
    deleteRequest.onsuccess = () => {
      console.log('✅ Database deleted successfully')
      console.log('🔄 Please refresh the page to recreate the database')
      resolve()
    }
    
    deleteRequest.onblocked = () => {
      console.warn('⚠️ Database deletion blocked - close all tabs and try again')
      reject(new Error('Database deletion blocked - close all tabs with this app and try again'))
    }
  })
}

// Expose to window for easy access in browser console
if (typeof window !== 'undefined') {
  (window as any).resetDatabase = resetDatabase
}