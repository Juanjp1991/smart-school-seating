import { DisplayOptions, DisplayPreferences } from '@/types/display'

export class DisplayOptionsService {
  private static readonly PREFERENCES_KEY = 'display_preferences'
  private static readonly DEFAULT_USER_ID = 'default_user'

  static async getDisplayOptions(): Promise<DisplayOptions> {
    try {
      const preferences = await this.getDisplayPreferences(this.DEFAULT_USER_ID)
      return preferences?.options || this.getDefaultOptions()
    } catch (error) {
      console.error('Error loading display options:', error)
      return this.getDefaultOptions()
    }
  }

  static async saveDisplayOptions(options: DisplayOptions): Promise<void> {
    try {
      const preferences: DisplayPreferences = {
        id: this.PREFERENCES_KEY,
        user_id: this.DEFAULT_USER_ID,
        options,
        created_at: new Date(),
        updated_at: new Date()
      }

      // Store in IndexedDB
      const db = await this.getDatabase()
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(['display_preferences'], 'readwrite')
        const store = transaction.objectStore('display_preferences')
        const request = store.put(preferences)
        
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })

      // Also store in localStorage as backup
      localStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(options))
    } catch (error) {
      console.error('Error saving display options:', error)
      // Fallback to localStorage only
      localStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(options))
    }
  }

  static async resetToDefaults(): Promise<DisplayOptions> {
    const defaults = this.getDefaultOptions()
    await this.saveDisplayOptions(defaults)
    return defaults
  }

  private static async getDisplayPreferences(userId: string): Promise<DisplayPreferences | null> {
    try {
      // Try IndexedDB first
      const db = await this.getDatabase()
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['display_preferences'], 'readonly')
        const store = transaction.objectStore('display_preferences')
        const request = store.get(userId)
        
        request.onsuccess = () => {
          resolve(request.result || null)
        }
        
        request.onerror = () => {
          reject(request.error)
        }
      })
    } catch (error) {
      console.warn('IndexedDB not available, falling back to localStorage:', error)
    }

    // Fallback to localStorage
    const stored = localStorage.getItem(this.PREFERENCES_KEY)
    if (stored) {
      try {
        const options = JSON.parse(stored)
        return {
          id: this.PREFERENCES_KEY,
          user_id: userId,
          options,
          created_at: new Date(),
          updated_at: new Date()
        }
      } catch (error) {
        console.error('Error parsing stored display options:', error)
      }
    }

    return null
  }

  private static getDefaultOptions(): DisplayOptions {
    return {
      showPhoto: true,
      showName: true,
      showRatings: false,
      ratingCategories: ['behavior', 'academic', 'participation'],
      compactMode: false
    }
  }

  private static async getDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('SmartSchoolDB', 5)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        const oldVersion = (event as IDBVersionChangeEvent).oldVersion
        
        // Create display_preferences store if it doesn't exist (version 5)
        if (oldVersion < 5 && !db.objectStoreNames.contains('display_preferences')) {
          const store = db.createObjectStore('display_preferences', { keyPath: 'id' })
          store.createIndex('user_id', 'user_id', { unique: false })
        }
      }
    })
  }
}