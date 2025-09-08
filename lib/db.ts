import { FurnitureItem } from '@/components/layout/types'
import { Rule } from '@/types/rule'
import { generateId } from './uuid'

export interface Layout {
  id: string
  name: string
  grid_rows: number
  grid_cols: number
  furniture: FurnitureItem[]
  seats: string[]
  created_at: Date
  updated_at: Date
}

export interface Roster {
  id: string
  name: string
  created_at: Date
  updated_at: Date
}

export interface Student {
  id: string
  first_name: string
  last_name: string
  student_id: string | null
  roster_id: string
  photo: string | null
  ratings: {
    behavior?: number
    academic?: number
    participation?: number
    [key: string]: number | undefined
  }
  created_at: Date
  updated_at: Date
}

class DatabaseService {
  private dbName = 'SmartSchoolDB'
  private version = 7
  private db: IDBDatabase | null = null
  private initPromise: Promise<void> | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('🗄️ Initializing database:', this.dbName, 'version:', this.version)
      
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB is not supported in this browser'))
        return
      }
      
      // Add timeout to prevent hanging
      const timeout = setTimeout(() => {
        console.error('⏰ Database initialization timeout')
        reject(new Error('Database initialization timeout - this might be due to a corrupt database. Try clearing browser data.'))
      }, 10000) // 10 second timeout
      
      const request = indexedDB.open(this.dbName, this.version)
      
      request.onerror = () => {
        clearTimeout(timeout)
        console.error('❌ Database initialization error:', request.error)
        reject(request.error)
      }
      
      request.onsuccess = () => {
        clearTimeout(timeout)
        console.log('✅ Database initialized successfully')
        this.db = request.result
        resolve()
      }
      
      request.onupgradeneeded = (event) => {
        console.log('🔄 Database upgrade needed')
        const db = request.result
        const oldVersion = (event as IDBVersionChangeEvent).oldVersion
        console.log(`📊 Upgrading database from version ${oldVersion} to ${this.version}`)
        
        // Create layouts store if it doesn't exist (version 1)
        if (!db.objectStoreNames.contains('layouts')) {
          console.log('📝 Creating layouts store')
          const store = db.createObjectStore('layouts', { keyPath: 'id' })
          store.createIndex('name', 'name', { unique: false })
          store.createIndex('created_at', 'created_at', { unique: false })
        }
        
        // Create rosters store (version 2)
        if (!db.objectStoreNames.contains('rosters')) {
          console.log('📋 Creating rosters store')
          const store = db.createObjectStore('rosters', { keyPath: 'id' })
          store.createIndex('name', 'name', { unique: false })
          store.createIndex('created_at', 'created_at', { unique: false })
        }
        
        // Create students store (version 3)
        if (!db.objectStoreNames.contains('students')) {
          console.log('👥 Creating students store')
          const store = db.createObjectStore('students', { keyPath: 'id' })
          store.createIndex('roster_id', 'roster_id', { unique: false })
          store.createIndex('last_name', 'last_name', { unique: false })
          store.createIndex('student_id', 'student_id', { unique: false })
        }
        
        // Create rules store (version 4)
        if (!db.objectStoreNames.contains('rules')) {
          console.log('📏 Creating rules store')
          const store = db.createObjectStore('rules', { keyPath: 'id' })
          store.createIndex('roster_id', 'roster_id', { unique: false })
          store.createIndex('priority', 'priority', { unique: false })
          store.createIndex('is_active', 'is_active', { unique: false })
        }
        
        // Create display_preferences store (version 5)
        if (!db.objectStoreNames.contains('display_preferences')) {
          console.log('⚙️ Creating display_preferences store')
          const store = db.createObjectStore('display_preferences', { keyPath: 'id' })
          store.createIndex('user_id', 'user_id', { unique: false })
        }
        
        console.log('✅ Database upgrade completed successfully')
        
        // Migrate student data to include photo and ratings (version 5)
        if (oldVersion < 5 && db.objectStoreNames.contains('students')) {
          console.log('🔄 Migrating student data for version 5')
          try {
            const transaction = (event.target as IDBOpenDBRequest).transaction!
            const studentStore = transaction.objectStore('students')
            
            // Get all existing students and migrate them
            const getRequest = studentStore.getAll()
            
            getRequest.onsuccess = () => {
              console.log('✅ Student migration completed')
              const students = getRequest.result as Student[]
              students.forEach((student: Student) => {
                // Add default values for new fields
                if (!student.photo) student.photo = null
                if (!student.ratings) student.ratings = {}
                try {
                  studentStore.put(student)
                } catch (migrationError) {
                  console.warn('⚠️ Failed to migrate student:', student.id, migrationError)
                }
              })
            }
            
            getRequest.onerror = () => {
              console.error('❌ Student migration failed:', getRequest.error)
            }
          } catch (migrationError) {
            console.error('❌ Migration process failed:', migrationError)
          }
        }
      }
    })
  }

  private async ensureConnection(): Promise<void> {
    if (this.db) {
      return
    }
    
    if (this.initPromise) {
      // If initialization is already in progress, wait for it
      await this.initPromise
      return
    }
    
    // Start initialization and store the promise
    this.initPromise = this.init()
    try {
      await this.initPromise
    } finally {
      // Clear the promise once it's resolved/rejected
      this.initPromise = null
    }
  }

  async saveLayout(layout: Omit<Layout, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    await this.ensureConnection()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['layouts'], 'readwrite')
      const store = transaction.objectStore('layouts')
      
      // Generate UUID for the layout
      const id = generateId()
      const now = new Date()
      
      const fullLayout: Layout = {
        ...layout,
        id,
        created_at: now,
        updated_at: now
      }
      
      const request = store.add(fullLayout)
      
      request.onsuccess = () => resolve(id)
      request.onerror = () => reject(request.error)
    })
  }

  async updateLayout(id: string, layout: Omit<Layout, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    await this.ensureConnection()
    
    return new Promise(async (resolve, reject) => {
      const transaction = this.db!.transaction(['layouts'], 'readwrite')
      const store = transaction.objectStore('layouts')
      
      // Get existing layout to preserve created_at
      const getRequest = store.get(id)
      
      getRequest.onsuccess = () => {
        const existingLayout = getRequest.result as Layout
        
        if (!existingLayout) {
          reject(new Error('Layout not found'))
          return
        }
        
        const updatedLayout: Layout = {
          ...layout,
          id,
          created_at: existingLayout.created_at,
          updated_at: new Date()
        }
        
        const putRequest = store.put(updatedLayout)
        putRequest.onsuccess = () => resolve()
        putRequest.onerror = () => reject(putRequest.error)
      }
      
      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  async getLayoutByName(name: string): Promise<Layout | null> {
    await this.ensureConnection()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['layouts'], 'readonly')
      const store = transaction.objectStore('layouts')
      const index = store.index('name')
      
      const request = index.get(name)
      
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  async getAllLayouts(): Promise<Layout[]> {
    await this.ensureConnection()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['layouts'], 'readonly')
      const store = transaction.objectStore('layouts')
      
      const request = store.getAll()
      
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async deleteLayout(id: string): Promise<void> {
    await this.ensureConnection()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['layouts'], 'readwrite')
      const store = transaction.objectStore('layouts')
      
      const request = store.delete(id)
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // Roster CRUD operations
  async saveRoster(roster: Omit<Roster, 'id' | 'created_at' | 'updated_at'>): Promise<Roster> {
    await this.ensureConnection()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['rosters'], 'readwrite')
      const store = transaction.objectStore('rosters')
      
      // Generate UUID for the roster
      const id = generateId()
      const now = new Date()
      
      const fullRoster: Roster = {
        ...roster,
        id,
        created_at: now,
        updated_at: now
      }
      
      const request = store.add(fullRoster)
      
      request.onsuccess = () => resolve(fullRoster)
      request.onerror = () => reject(request.error)
    })
  }

  async getAllRosters(): Promise<Roster[]> {
    await this.ensureConnection()
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }
      
      console.log('📋 Getting all rosters...')
      const transaction = this.db!.transaction(['rosters'], 'readonly')
      const store = transaction.objectStore('rosters')
      
      const request = store.getAll()
      
      request.onerror = () => {
        console.error('❌ Error getting rosters:', request.error)
        reject(request.error)
      }
      
      request.onsuccess = () => {
        console.log('✅ Successfully retrieved rosters:', request.result.length)
        // Sort by created_at descending (newest first)
        const rosters = request.result.sort((a: Roster, b: Roster) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        resolve(rosters)
      }
    })
  }

  async getRosterById(id: string): Promise<Roster | null> {
    await this.ensureConnection()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['rosters'], 'readonly')
      const store = transaction.objectStore('rosters')
      
      const request = store.get(id)
      
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  async updateRoster(id: string, updates: Partial<Pick<Roster, 'name'>>): Promise<Roster> {
    await this.ensureConnection()
    
    return new Promise(async (resolve, reject) => {
      const transaction = this.db!.transaction(['rosters'], 'readwrite')
      const store = transaction.objectStore('rosters')
      
      // Get existing roster to preserve created_at
      const getRequest = store.get(id)
      
      getRequest.onsuccess = () => {
        const existingRoster = getRequest.result as Roster
        
        if (!existingRoster) {
          reject(new Error('Roster not found'))
          return
        }
        
        const updatedRoster: Roster = {
          ...existingRoster,
          ...updates,
          updated_at: new Date()
        }
        
        const putRequest = store.put(updatedRoster)
        putRequest.onsuccess = () => resolve(updatedRoster)
        putRequest.onerror = () => reject(putRequest.error)
      }
      
      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  async deleteRoster(id: string): Promise<void> {
    await this.ensureConnection()
    
    return new Promise(async (resolve, reject) => {
      try {
        // First delete all students for this roster
        await this.deleteAllStudentsForRoster(id)
        
        // Then delete the roster
        const transaction = this.db!.transaction(['rosters'], 'readwrite')
        const store = transaction.objectStore('rosters')
        
        const request = store.delete(id)
        
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      } catch (error) {
        reject(error)
      }
    })
  }

  async getRosterByName(name: string): Promise<Roster | null> {
    await this.ensureConnection()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['rosters'], 'readonly')
      const store = transaction.objectStore('rosters')
      const index = store.index('name')
      
      const request = index.get(name)
      
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  // Student CRUD operations
  async saveStudent(student: Omit<Student, 'id' | 'created_at' | 'updated_at'>): Promise<Student> {
    await this.ensureConnection()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['students'], 'readwrite')
      const store = transaction.objectStore('students')
      
      // Generate UUID for the student
      const id = generateId()
      const now = new Date()
      
      const fullStudent: Student = {
        ...student,
        id,
        photo: student.photo || null,
        ratings: student.ratings || {},
        created_at: now,
        updated_at: now
      }
      
      const request = store.add(fullStudent)
      
      request.onsuccess = () => resolve(fullStudent)
      request.onerror = () => reject(request.error)
    })
  }

  async getAllStudentsForRoster(rosterId: string): Promise<Student[]> {
    await this.ensureConnection()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['students'], 'readonly')
      const store = transaction.objectStore('students')
      const index = store.index('roster_id')
      
      const request = index.getAll(rosterId)
      
      request.onsuccess = () => {
        // Sort by last name, then first name
        const students = request.result.sort((a: Student, b: Student) => {
          const lastNameComparison = a.last_name.localeCompare(b.last_name)
          if (lastNameComparison !== 0) return lastNameComparison
          return a.first_name.localeCompare(b.first_name)
        })
        resolve(students)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async getStudentById(id: string): Promise<Student | null> {
    await this.ensureConnection()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['students'], 'readonly')
      const store = transaction.objectStore('students')
      
      const request = store.get(id)
      
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  async updateStudent(id: string, updates: Partial<Pick<Student, 'first_name' | 'last_name' | 'student_id' | 'photo' | 'ratings'>>): Promise<Student> {
    await this.ensureConnection()
    
    return new Promise(async (resolve, reject) => {
      const transaction = this.db!.transaction(['students'], 'readwrite')
      const store = transaction.objectStore('students')
      
      // Get existing student to preserve other fields
      const getRequest = store.get(id)
      
      getRequest.onsuccess = () => {
        const existingStudent = getRequest.result as Student
        
        if (!existingStudent) {
          reject(new Error('Student not found'))
          return
        }
        
        const updatedStudent: Student = {
          ...existingStudent,
          ...updates,
          updated_at: new Date()
        }
        
        const putRequest = store.put(updatedStudent)
        putRequest.onsuccess = () => resolve(updatedStudent)
        putRequest.onerror = () => reject(putRequest.error)
      }
      
      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  async updateStudentPhoto(studentId: string, photoBase64: string): Promise<Student> {
    return this.updateStudent(studentId, { photo: photoBase64 })
  }

  async updateStudentRatings(studentId: string, ratings: Student['ratings']): Promise<Student> {
    return this.updateStudent(studentId, { ratings })
  }

  async deleteStudent(id: string): Promise<void> {
    await this.ensureConnection()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['students'], 'readwrite')
      const store = transaction.objectStore('students')
      
      const request = store.delete(id)
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async deleteAllStudentsForRoster(rosterId: string): Promise<void> {
    await this.ensureConnection()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['students'], 'readwrite')
      const store = transaction.objectStore('students')
      const index = store.index('roster_id')
      
      const request = index.openCursor(IDBKeyRange.only(rosterId))
      
      request.onsuccess = () => {
        const cursor = request.result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        } else {
          resolve()
        }
      }
      
      request.onerror = () => reject(request.error)
    })
  }

  async validateStudentId(studentId: string, rosterId: string, excludeId?: string): Promise<boolean> {
    if (!studentId.trim()) return true // Empty student ID is valid
    
    await this.ensureConnection()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['students'], 'readonly')
      const store = transaction.objectStore('students')
      const index = store.index('roster_id')
      
      const request = index.getAll(rosterId)
      
      request.onsuccess = () => {
        const students = request.result as Student[]
        const conflict = students.find(student => 
          student.student_id === studentId.trim() && 
          student.id !== excludeId
        )
        resolve(!conflict) // Valid if no conflict found
      }
      
      request.onerror = () => reject(request.error)
    })
  }

  // Bulk student creation methods
  async bulkCreateStudents(students: Array<Omit<Student, 'id' | 'created_at' | 'updated_at'>>): Promise<Student[]> {
    await this.ensureConnection()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['students'], 'readwrite')
      const store = transaction.objectStore('students')
      
      const createdStudents: Student[] = []
      let completed = 0
      let hasError = false
      
      students.forEach((studentData, index) => {
        const id = generateId()
        const now = new Date()
        
        const student: Student = {
          ...studentData,
          id,
          photo: studentData.photo || null,
          ratings: studentData.ratings || {},
          created_at: now,
          updated_at: now
        }
        
        const request = store.add(student)
        
        request.onsuccess = () => {
          createdStudents[index] = student
          completed++
          
          if (completed === students.length && !hasError) {
            resolve(createdStudents.filter(s => s)) // Filter out undefined
          }
        }
        
        request.onerror = () => {
          hasError = true
          reject(new Error(`Failed to create student ${index + 1}: ${request.error?.message || 'Unknown error'}`))
        }
      })
      
      // Handle empty students array
      if (students.length === 0) {
        resolve([])
      }
    })
  }

  async validateBulkImport(
    students: Array<{firstName: string; lastName: string; studentId?: string}>, 
    rosterId: string
  ): Promise<{
    valid: Array<Omit<Student, 'id' | 'created_at' | 'updated_at'>>
    invalid: Array<{row: number, data: Record<string, string>, errors: string[]}>
  }> {
    const valid: Array<Omit<Student, 'id' | 'created_at' | 'updated_at'>> = []
    const invalid: Array<{row: number, data: Record<string, string>, errors: string[]}> = []
    
    // Check for duplicate student IDs within the import data
    const studentIdMap = new Map<string, number>()
    
    for (let i = 0; i < students.length; i++) {
      const student = students[i]
      const errors: string[] = []
      
      // Validate required fields
      if (!student.firstName || !student.firstName.trim()) {
        errors.push('First name is required')
      }
      if (!student.lastName || !student.lastName.trim()) {
        errors.push('Last name is required')
      }
      
      // Validate field lengths
      if (student.firstName && student.firstName.trim().length > 30) {
        errors.push('First name must be 30 characters or less')
      }
      if (student.lastName && student.lastName.trim().length > 30) {
        errors.push('Last name must be 30 characters or less')
      }
      if (student.studentId && student.studentId.trim().length > 20) {
        errors.push('Student ID must be 20 characters or less')
      }
      
      // Check for duplicate student IDs within import
      if (student.studentId && student.studentId.trim()) {
        const trimmedId = student.studentId.trim()
        if (studentIdMap.has(trimmedId)) {
          errors.push(`Duplicate student ID within import: ${trimmedId}`)
        } else {
          studentIdMap.set(trimmedId, i + 1)
        }
      }
      
      // Check for duplicate student IDs in database
      if (student.studentId && student.studentId.trim() && errors.length === 0) {
        try {
          const isValid = await this.validateStudentId(student.studentId.trim(), rosterId)
          if (!isValid) {
            errors.push(`Student ID already exists in roster: ${student.studentId.trim()}`)
          }
        } catch (error) {
          errors.push('Error validating student ID')
        }
      }
      
      if (errors.length > 0) {
        invalid.push({
          row: i + 1,
          data: student,
          errors
        })
      } else {
        valid.push({
          first_name: student.firstName.trim(),
          last_name: student.lastName.trim(),
          student_id: student.studentId ? student.studentId.trim() : null,
          roster_id: rosterId,
          photo: null,
          ratings: {}
        })
      }
    }
    
    return { valid, invalid }
  }

  // Rule CRUD operations
  async createRule(rule: Omit<Rule, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    await this.ensureConnection()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['rules'], 'readwrite')
      const store = transaction.objectStore('rules')
      
      const id = generateId()
      const now = new Date()
      
      const fullRule: Rule = {
        ...rule,
        id,
        created_at: now,
        updated_at: now
      }
      
      const request = store.add(fullRule)
      
      request.onsuccess = () => resolve(id)
      request.onerror = () => reject(request.error)
    })
  }

  async getRulesByRoster(rosterId: string): Promise<Rule[]> {
    await this.ensureConnection()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['rules'], 'readonly')
      const store = transaction.objectStore('rules')
      const index = store.index('roster_id')
      
      const request = index.getAll(rosterId)
      
      request.onsuccess = () => {
        const rules = request.result as Rule[]
        // Sort by priority (ascending - lower numbers = higher priority)
        rules.sort((a, b) => a.priority - b.priority)
        resolve(rules)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async updateRule(ruleId: string, updates: Partial<Rule>): Promise<void> {
    await this.ensureConnection()
    
    return new Promise(async (resolve, reject) => {
      const transaction = this.db!.transaction(['rules'], 'readwrite')
      const store = transaction.objectStore('rules')
      
      // Get existing rule to preserve created_at
      const getRequest = store.get(ruleId)
      
      getRequest.onsuccess = () => {
        const existingRule = getRequest.result as Rule
        
        if (!existingRule) {
          reject(new Error('Rule not found'))
          return
        }
        
        const updatedRule: Rule = {
          ...existingRule,
          ...updates,
          id: ruleId,
          created_at: existingRule.created_at,
          updated_at: new Date()
        }
        
        const putRequest = store.put(updatedRule)
        putRequest.onsuccess = () => resolve()
        putRequest.onerror = () => reject(putRequest.error)
      }
      
      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  async deleteRule(ruleId: string): Promise<void> {
    await this.ensureConnection()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['rules'], 'readwrite')
      const store = transaction.objectStore('rules')
      
      const request = store.delete(ruleId)
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getRuleById(ruleId: string): Promise<Rule | null> {
    await this.ensureConnection()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['rules'], 'readonly')
      const store = transaction.objectStore('rules')
      
      const request = store.get(ruleId)
      
      request.onsuccess = () => {
        const rule = request.result as Rule | undefined
        resolve(rule || null)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async reorderRules(rosterId: string, orderedRuleIds: string[]): Promise<void> {
    await this.ensureConnection()
    
    return new Promise(async (resolve, reject) => {
      const transaction = this.db!.transaction(['rules'], 'readwrite')
      const store = transaction.objectStore('rules')
      
      try {
        // Update priority for each rule based on its position in the ordered list
        for (let i = 0; i < orderedRuleIds.length; i++) {
          const ruleId = orderedRuleIds[i]
          const getRequest = store.get(ruleId)
          
          await new Promise<void>((ruleResolve, ruleReject) => {
            getRequest.onsuccess = () => {
              const existingRule = getRequest.result as Rule
              
              if (existingRule && existingRule.roster_id === rosterId) {
                const updatedRule: Rule = {
                  ...existingRule,
                  priority: i + 1, // Priority starts at 1
                  updated_at: new Date()
                }
                
                const putRequest = store.put(updatedRule)
                putRequest.onsuccess = () => ruleResolve()
                putRequest.onerror = () => ruleReject(putRequest.error)
              } else {
                ruleResolve() // Skip if rule doesn't exist or belongs to different roster
              }
            }
            
            getRequest.onerror = () => ruleReject(getRequest.error)
          })
        }
        
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }
}

// Export singleton instance
export const dbService = new DatabaseService()