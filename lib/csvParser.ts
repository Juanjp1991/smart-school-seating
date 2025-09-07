// CSV parsing and import utilities

export interface CsvRow {
  [key: string]: string
}

export interface CsvImportData {
  headers: string[]
  rows: CsvRow[]
  totalRows: number
}

export interface ColumnMapping {
  csvHeader: string
  appField: string
  required: boolean
}

export interface ImportValidationError {
  row: number
  field: string
  message: string
  severity: 'error' | 'warning'
}

export interface ValidatedImportData {
  validRows: Array<{
    firstName: string
    lastName: string
    studentId?: string
    originalRow: CsvRow
    rowIndex: number
  }>
  invalidRows: Array<{
    row: number
    data: CsvRow
    errors: ImportValidationError[]
  }>
  warnings: ImportValidationError[]
}

export interface AppFieldMapping {
  firstName: string
  lastName: string
  studentId?: string
  fullName?: string
}

export interface ParsedName {
  firstName: string
  lastName: string
  confidence: 'high' | 'medium' | 'low'
  format?: 'last_first_comma' | 'first_last_space' | 'last_first_space' | 'single_word'
  error?: string
}

// Standard app fields for CSV import
export const APP_FIELDS = {
  firstName: 'First Name',
  lastName: 'Last Name',
  fullName: 'Full Name (First Last or Last, First)',
  studentId: 'Student ID (optional)'
}

export const FIELD_VALIDATORS = {
  firstName: (value: string): ImportValidationError | null => {
    if (!value || !value.trim()) {
      return {
        row: 0,
        field: 'firstName',
        message: 'First name is required',
        severity: 'error'
      }
    }
    if (value.trim().length > 30) {
      return {
        row: 0,
        field: 'firstName',
        message: 'First name must be 30 characters or less',
        severity: 'error'
      }
    }
    return null
  },
  lastName: (value: string): ImportValidationError | null => {
    if (!value || !value.trim()) {
      return {
        row: 0,
        field: 'lastName',
        message: 'Last name is required',
        severity: 'error'
      }
    }
    if (value.trim().length > 30) {
      return {
        row: 0,
        field: 'lastName',
        message: 'Last name must be 30 characters or less',
        severity: 'error'
      }
    }
    return null
  },
  studentId: (value: string): ImportValidationError | null => {
    if (value && value.trim().length > 20) {
      return {
        row: 0,
        field: 'studentId',
        message: 'Student ID must be 20 characters or less',
        severity: 'error'
      }
    }
    return null
  },
  fullName: (value: string): ImportValidationError | null => {
    if (!value || !value.trim()) {
      return {
        row: 0,
        field: 'fullName',
        message: 'Full name is required',
        severity: 'error'
      }
    }
    if (value.trim().length > 100) {
      return {
        row: 0,
        field: 'fullName',
        message: 'Full name must be 100 characters or less',
        severity: 'error'
      }
    }
    return null
  }
}

class CsvParser {
  private detectDelimiter(lines: string[]): string {
    const commonDelimiters = [',', ';', '\t', '|']
    const firstLine = lines[0]
    
    for (const delimiter of commonDelimiters) {
      if (firstLine.includes(delimiter)) {
        return delimiter
      }
    }
    
    return ',' // Default to comma
  }

  private parseLine(line: string, delimiter: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current.trim())
    return result
  }

  async parseFile(file: File): Promise<CsvImportData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const lines = content.split('\n').filter(line => line.trim())
          
          if (lines.length === 0) {
            reject(new Error('CSV file is empty'))
            return
          }
          
          const delimiter = this.detectDelimiter(lines)
          const headers = this.parseLine(lines[0], delimiter)
          const rows: CsvRow[] = []
          
          for (let i = 1; i < lines.length; i++) {
            const values = this.parseLine(lines[i], delimiter)
            const row: CsvRow = {}
            
            headers.forEach((header, index) => {
              row[header] = values[index] || ''
            })
            
            rows.push(row)
          }
          
          resolve({
            headers,
            rows,
            totalRows: rows.length
          })
        } catch (error) {
          reject(new Error(`Failed to parse CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`))
        }
      }
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }
      
      reader.readAsText(file)
    })
  }

  validateCsvData(data: CsvImportData, mapping: Record<string, string>): ValidatedImportData {
    const validRows: ValidatedImportData['validRows'] = []
    const invalidRows: ValidatedImportData['invalidRows'] = []
    const warnings: ImportValidationError[] = []

    // Check if fullName is being used
    const hasFullName = Object.values(mapping).includes('fullName')
    const hasSeparateNames = Object.values(mapping).includes('firstName') && Object.values(mapping).includes('lastName')

    data.rows.forEach((row, rowIndex) => {
      const errors: ImportValidationError[] = []
      const validatedRow: ValidatedImportData['validRows'][0] = {
        firstName: '',
        lastName: '',
        originalRow: row,
        rowIndex: rowIndex + 1 // 1-based for user display
      }

      // Validate each mapped field
      Object.entries(mapping).forEach(([csvHeader, appField]) => {
        const value = row[csvHeader] || ''
        const validator = FIELD_VALIDATORS[appField as keyof typeof FIELD_VALIDATORS]
        
        if (validator) {
          const error = validator(value)
          if (error) {
            errors.push({
              ...error,
              row: rowIndex + 1
            })
          }
        }

        // Handle fullName parsing
        if (appField === 'fullName') {
          const parsedName = this.parseFullName(value)
          validatedRow.firstName = parsedName.firstName
          validatedRow.lastName = parsedName.lastName
          
          // Add warnings for low confidence parsing
          if (parsedName.confidence === 'low') {
            warnings.push({
              row: rowIndex + 1,
              field: 'fullName',
              message: parsedName.error || 'Name format could not be confidently parsed',
              severity: 'warning'
            })
          }
          
          // Add info about detected format
          if (parsedName.format) {
            warnings.push({
              row: rowIndex + 1,
              field: 'fullName',
              message: `Detected name format: ${parsedName.format.replace('_', ' ')}`,
              severity: 'warning'
            })
          }
        } else {
          // Assign value to validated row for other fields
          if (appField === 'firstName') {
            validatedRow.firstName = value.trim()
          } else if (appField === 'lastName') {
            validatedRow.lastName = value.trim()
          } else if (appField === 'studentId') {
            validatedRow.studentId = value.trim() || undefined
          }
        }
      })

      // Validation for name completeness
      if (hasFullName && !validatedRow.firstName) {
        errors.push({
          row: rowIndex + 1,
          field: 'fullName',
          message: 'Full name must contain at least a first name',
          severity: 'error'
        })
      } else if (hasSeparateNames && (!validatedRow.firstName || !validatedRow.lastName)) {
        if (!validatedRow.firstName) {
          errors.push({
            row: rowIndex + 1,
            field: 'firstName',
            message: 'First name is required',
            severity: 'error'
          })
        }
        if (!validatedRow.lastName) {
          errors.push({
            row: rowIndex + 1,
            field: 'lastName',
            message: 'Last name is required',
            severity: 'error'
          })
        }
      }

      // Check for warnings
      if (validatedRow.firstName && validatedRow.lastName) {
        const fullName = `${validatedRow.firstName} ${validatedRow.lastName}`
        if (fullName.length > 60) {
          warnings.push({
            row: rowIndex + 1,
            field: 'fullName',
            message: 'Full name is quite long',
            severity: 'warning'
          })
        }
      }

      if (errors.length > 0) {
        invalidRows.push({
          row: rowIndex + 1,
          data: row,
          errors
        })
      } else {
        validRows.push(validatedRow)
      }
    })

    return {
      validRows,
      invalidRows,
      warnings
    }
  }

  suggestColumnMappings(headers: string[]): Record<string, string> {
    const mapping: Record<string, string> = {}
    
    const fieldSynonyms = {
      firstName: ['first', 'first name', 'firstname', 'given name', 'name'],
      lastName: ['last', 'last name', 'lastname', 'surname', 'family name'],
      fullName: ['full name', 'fullname', 'student name', 'name', 'participant', 'attendee'],
      studentId: ['id', 'student id', 'studentid', 'student number', 'student#', 'sid']
    }

    headers.forEach(header => {
      const normalizedHeader = header.toLowerCase().trim()
      
      for (const [field, synonyms] of Object.entries(fieldSynonyms)) {
        if (synonyms.some(synonym => normalizedHeader.includes(synonym))) {
          mapping[header] = field
          break
        }
      }
    })

    return mapping
  }

  parseFullName(fullName: string): ParsedName {
    const trimmed = fullName.trim()
    
    if (!trimmed) {
      return {
        firstName: '',
        lastName: '',
        confidence: 'low',
        error: 'Empty name'
      }
    }

    // Format 1: "Last, First" (most reliable)
    if (trimmed.includes(',')) {
      const parts = trimmed.split(',').map(part => part.trim())
      if (parts.length >= 2) {
        return {
          firstName: parts[1],
          lastName: parts[0],
          confidence: 'high',
          format: 'last_first_comma'
        }
      }
    }

    // Format 2: "First Last" or "First Middle Last"
    const spaceParts = trimmed.split(/\s+/).filter(part => part.length > 0)
    
    if (spaceParts.length === 1) {
      // Single word - could be first or last name
      return {
        firstName: spaceParts[0],
        lastName: '',
        confidence: 'low',
        format: 'single_word',
        error: 'Single name only - please specify first and last name'
      }
    } else if (spaceParts.length === 2) {
      // "First Last" format
      return {
        firstName: spaceParts[0],
        lastName: spaceParts[1],
        confidence: 'medium',
        format: 'first_last_space'
      }
    } else if (spaceParts.length >= 3) {
      // "First Middle Last" format
      return {
        firstName: spaceParts.slice(0, -1).join(' '),
        lastName: spaceParts[spaceParts.length - 1],
        confidence: 'medium',
        format: 'first_last_space'
      }
    }

    // Fallback
    return {
      firstName: trimmed,
      lastName: '',
      confidence: 'low',
      error: 'Unable to parse name format'
    }
  }

  generateSampleCsv(): string {
    const headers = ['First Name', 'Last Name', 'Student ID']
    const sampleData = [
      ['John', 'Doe', '12345'],
      ['Jane', 'Smith', '12346'],
      ['Bob', 'Johnson', '']
    ]

    const csvLines = [
      headers.join(','),
      ...sampleData.map(row => row.map(cell => `"${cell}"`).join(','))
    ]

    return csvLines.join('\n')
  }
}

export const csvParser = new CsvParser()