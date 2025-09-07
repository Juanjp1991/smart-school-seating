'use client'

import { useState } from 'react'
import FileUpload from '@/components/common/FileUpload'
import DataPreview from '@/components/common/DataPreview'
import { csvParser, CsvImportData, ValidatedImportData, APP_FIELDS } from '@/lib/csvParser'
import { dbService, Student } from '@/lib/db'

interface CsvImportModalProps {
  isOpen: boolean
  onClose: () => void
  rosterId: string
  onImportComplete: (students: Student[]) => void
}

type ImportStep = 'upload' | 'mapping' | 'preview' | 'importing'

export default function CsvImportModal({
  isOpen,
  onClose,
  rosterId,
  onImportComplete
}: CsvImportModalProps) {
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload')
  const [csvData, setCsvData] = useState<CsvImportData | null>(null)
  const [validatedData, setValidatedData] = useState<ValidatedImportData | null>(null)
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetState = () => {
    setCurrentStep('upload')
    setCsvData(null)
    setValidatedData(null)
    setColumnMapping({})
    setIsImporting(false)
    setError(null)
  }

  const handleClose = () => {
    if (!isImporting) {
      resetState()
      onClose()
    }
  }

  const handleFileSelect = async (file: File) => {
    try {
      setError(null)
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }
      
      // Validate file type
      const allowedTypes = ['text/csv', 'application/csv', 'text/plain']
      const fileExtension = file.name.toLowerCase().split('.').pop()
      if (!allowedTypes.includes(file.type) && !['csv', 'txt'].includes(fileExtension || '')) {
        setError('Please select a CSV file (.csv or .txt)')
        return
      }
      
      const data = await csvParser.parseFile(file)
      
      // Validate CSV data structure
      if (!data.headers || data.headers.length === 0) {
        setError('CSV file must have headers in the first row')
        return
      }
      
      if (data.totalRows === 0) {
        setError('CSV file contains no data rows')
        return
      }
      
      // Limit to 1000 rows for performance
      if (data.totalRows > 1000) {
        setError('CSV file contains too many rows (max 1000). Please split your file into smaller batches.')
        return
      }
      
      setCsvData(data)
      
      // Suggest column mappings
      const suggestedMapping = csvParser.suggestColumnMappings(data.headers)
      setColumnMapping(suggestedMapping)
      
      setCurrentStep('mapping')
    } catch (err) {
      console.error('File processing error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to parse CSV file'
      
      // Handle specific error cases
      if (errorMessage.includes('format') || errorMessage.includes('parse')) {
        setError('Invalid CSV format. Please ensure your file is properly formatted CSV.')
      } else if (errorMessage.includes('empty')) {
        setError('CSV file is empty or contains no data.')
      } else if (errorMessage.includes('encoding')) {
        setError('CSV file encoding error. Please save your file as UTF-8 and try again.')
      } else {
        setError(errorMessage)
      }
    }
  }

  const handleMappingSubmit = () => {
    if (!csvData) return

    try {
      setError(null)
      
      // Validate that required name fields are mapped
      const hasFirstName = Object.values(columnMapping).includes('firstName')
      const hasLastName = Object.values(columnMapping).includes('lastName')
      const hasFullName = Object.values(columnMapping).includes('fullName')
      
      // Users can either use separate first/last name columns OR a full name column
      const hasValidNameMapping = (hasFirstName && hasLastName) || hasFullName
      
      if (!hasValidNameMapping) {
        setError('You must map either both First Name and Last Name columns, OR a Full Name column')
        return
      }
      
      const validated = csvParser.validateCsvData(csvData, columnMapping)
      
      // Check if we have any valid rows
      if (validated.validRows.length === 0) {
        setError('No valid students found. Please check your column mappings and data.')
        return
      }
      
      // Check if all rows are invalid
      if (validated.invalidRows.length === csvData.totalRows) {
        setError('All rows contain validation errors. Please check your data format and required fields.')
        return
      }
      
      setValidatedData(validated)
      setCurrentStep('preview')
    } catch (err) {
      console.error('Validation error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to validate data'
      setError(errorMessage)
    }
  }

  const handleImportConfirm = async () => {
    if (!validatedData || validatedData.validRows.length === 0) {
      setError('No valid students to import')
      return
    }

    setIsImporting(true)
    setError(null)

    try {
      // Convert validated data to database format
      const studentsToImport = validatedData.validRows.map(row => ({
        firstName: row.firstName,
        lastName: row.lastName,
        studentId: row.studentId
      }))

      // Validate and create students
      const { valid, invalid } = await dbService.validateBulkImport(studentsToImport, rosterId)
      
      if (valid.length === 0) {
        setError('No valid students to import. Please check your data and try again.')
        return
      }

      // Show warning if some rows are invalid
      if (invalid.length > 0) {
        const warningMsg = `${invalid.length} row${invalid.length !== 1 ? 's' : ''} will be skipped due to validation errors. Continue with ${valid.length} valid student${valid.length !== 1 ? 's' : ''}?`
        if (!window.confirm(warningMsg)) {
          return
        }
      }

      const createdStudents = await dbService.bulkCreateStudents(valid)
      
      // Show success message with details
      const successMsg = `Successfully imported ${createdStudents.length} student${createdStudents.length !== 1 ? 's' : ''}!`
      if (invalid.length > 0) {
        const additionalInfo = ` (${invalid.length} row${invalid.length !== 1 ? 's' : ''} skipped)`
        alert(successMsg + additionalInfo)
      } else {
        alert(successMsg)
      }
      
      onImportComplete(createdStudents)
      resetState()
      onClose()
    } catch (err) {
      console.error('Import error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to import students'
      setError(errorMessage)
      
      // Handle specific error cases
      if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
        setError('Import failed: Too many students. Please import in smaller batches.')
      } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
        setError('Import failed: Network error. Please check your connection and try again.')
      } else if (errorMessage.includes('permission') || errorMessage.includes('access')) {
        setError('Import failed: Permission denied. Please refresh the page and try again.')
      }
    } finally {
      setIsImporting(false)
    }
  }

  const downloadSampleCsv = () => {
    const sampleCsv = csvParser.generateSampleCsv()
    const blob = new Blob([sampleCsv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'sample_students.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleBack = () => {
    if (currentStep === 'preview') {
      setCurrentStep('mapping')
    } else if (currentStep === 'mapping') {
      setCurrentStep('upload')
    }
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}
    onClick={handleClose}
  >
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        flexDirection: 'column'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: '#f8f9fa'
      }}>
        <h2 style={{
          margin: '0 0 0.5rem 0',
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#333'
        }}>
          Import Students from CSV
        </h2>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          fontSize: '0.9rem',
          color: '#666'
        }}>
          <span>Step {currentStep === 'upload' ? '1' : currentStep === 'mapping' ? '2' : '3'} of 3</span>
          <span>•</span>
          <span>
            {currentStep === 'upload' && 'Upload CSV File'}
            {currentStep === 'mapping' && 'Map Columns'}
            {currentStep === 'preview' && 'Review & Import'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1.5rem'
      }}>
        {error && (
          <div style={{
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            color: '#721c24',
            padding: '1rem',
            borderRadius: '6px',
            marginBottom: '1.5rem'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {currentStep === 'upload' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            <FileUpload
              onFileSelect={handleFileSelect}
              accept=".csv,.txt"
              maxSize={10}
            />
            
            <div style={{
              textAlign: 'center',
              padding: '1rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
              border: '1px solid #dee2e6',
            }}>
              <p style={{ margin: '0 0 1rem 0', color: '#666' }}>
                Don&apos;t have a CSV file? Download a sample to see the expected format:
              </p>
              <button
                onClick={downloadSampleCsv}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#0056b3'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#007bff'
                }}
              >
                Download Sample CSV
              </button>
            </div>
          </div>
        )}

        {currentStep === 'mapping' && csvData && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            <div>
              <h3 style={{
                margin: '0 0 1rem 0',
                fontSize: '1.2rem',
                fontWeight: '600',
                color: '#333'
              }}>
                Map Your CSV Columns
              </h3>
              <p style={{
                margin: 0,
                color: '#666',
                fontSize: '0.9rem'
              }}>
                Match your CSV file headers to the app&apos;s student fields:
              </p>
            </div>

            <div style={{
              backgroundColor: 'white',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr auto',
                gap: '1rem',
                padding: '1rem',
                backgroundColor: '#f8f9fa',
                borderBottom: '1px solid #dee2e6',
                fontWeight: '600',
                fontSize: '0.9rem',
                color: '#495057'
              }}>
                <div>Your CSV Header</div>
                <div>App Field</div>
                <div>Required</div>
              </div>

              <div style={{ padding: '1rem' }}>
                {csvData.headers.map((header, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr auto',
                      gap: '1rem',
                      alignItems: 'center',
                      padding: '0.75rem 0',
                      borderBottom: index < csvData.headers.length - 1 ? '1px solid #f1f3f4' : 'none'
                    }}
                  >
                    <div style={{
                      fontFamily: 'monospace',
                      fontSize: '0.9rem',
                      color: '#333'
                    }}>
                      {header}
                    </div>
                    
                    <select
                      value={columnMapping[header] || ''}
                      onChange={(e) => setColumnMapping(prev => ({
                        ...prev,
                        [header]: e.target.value
                      }))}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        fontSize: '0.9rem',
                        backgroundColor: 'white'
                      }}
                    >
                      <option value="">-- Ignore --</option>
                      {Object.entries(APP_FIELDS).map(([field, label]) => (
                        <option key={field} value={field}>
                          {label}
                        </option>
                      ))}
                    </select>

                    <div style={{
                      fontSize: '0.8rem',
                      color: columnMapping[header] === 'firstName' || columnMapping[header] === 'lastName' || columnMapping[header] === 'fullName' ? '#dc3545' : '#666'
                    }}>
                      {columnMapping[header] === 'firstName' || columnMapping[header] === 'lastName' || columnMapping[header] === 'fullName' ? 'Required' : 'Optional'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>
                Found {csvData.totalRows} rows in your CSV file
              </div>
              
              <div style={{
                display: 'flex',
                gap: '0.75rem'
              }}>
                <button
                  onClick={handleBack}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#5a6268'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#6c757d'
                  }}
                >
                  Back
                </button>
                
                <button
                  onClick={handleMappingSubmit}
                  disabled={Object.keys(columnMapping).length === 0 || 
                           !(Object.values(columnMapping).includes('firstName') && 
                             Object.values(columnMapping).includes('lastName')) &&
                           !Object.values(columnMapping).includes('fullName')}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: Object.keys(columnMapping).length === 0 || 
                              !(Object.values(columnMapping).includes('firstName') && 
                                Object.values(columnMapping).includes('lastName')) &&
                              !Object.values(columnMapping).includes('fullName')
                              ? '#ccc' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    cursor: Object.keys(columnMapping).length === 0 || 
                              !(Object.values(columnMapping).includes('firstName') && 
                                Object.values(columnMapping).includes('lastName')) &&
                              !Object.values(columnMapping).includes('fullName')
                              ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (Object.keys(columnMapping).length > 0 && 
                        ((Object.values(columnMapping).includes('firstName') && 
                          Object.values(columnMapping).includes('lastName')) ||
                         Object.values(columnMapping).includes('fullName'))) {
                      e.currentTarget.style.backgroundColor = '#0056b3'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (Object.keys(columnMapping).length > 0 && 
                        ((Object.values(columnMapping).includes('firstName') && 
                          Object.values(columnMapping).includes('lastName')) ||
                         Object.values(columnMapping).includes('fullName'))) {
                      e.currentTarget.style.backgroundColor = '#007bff'
                    }
                  }}
                >
                  Continue to Preview
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'preview' && validatedData && (
          <DataPreview
            data={validatedData}
            onBack={handleBack}
            onConfirm={handleImportConfirm}
            isLoading={isImporting}
          />
        )}
      </div>
    </div>
  </div>
  )
}