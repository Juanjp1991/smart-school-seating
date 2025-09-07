'use client'

import { ValidatedImportData, ImportValidationError } from '@/lib/csvParser'

interface DataPreviewProps {
  data: ValidatedImportData
  onBack?: () => void
  onConfirm?: () => void
  isLoading?: boolean
}

export default function DataPreview({
  data,
  onBack,
  onConfirm,
  isLoading = false
}: DataPreviewProps) {
  const totalRows = data.validRows.length + data.invalidRows.length
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    }}>
      {/* Summary */}
      <div style={{
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        padding: '1.5rem'
      }}>
        <h3 style={{
          margin: '0 0 1rem 0',
          fontSize: '1.2rem',
          fontWeight: '600',
          color: '#333'
        }}>
          Import Summary
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '1rem',
            backgroundColor: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '6px'
          }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#28a745'
            }}>
              {data.validRows.length}
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: '#666'
            }}>
              Valid Rows
            </div>
          </div>
          
          <div style={{
            textAlign: 'center',
            padding: '1rem',
            backgroundColor: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '6px'
          }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: data.invalidRows.length > 0 ? '#dc3545' : '#6c757d'
            }}>
              {data.invalidRows.length}
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: '#666'
            }}>
              Invalid Rows
            </div>
          </div>
          
          <div style={{
            textAlign: 'center',
            padding: '1rem',
            backgroundColor: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '6px'
          }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#007bff'
            }}>
              {totalRows}
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: '#666'
            }}>
              Total Rows
            </div>
          </div>
        </div>
        
        {data.warnings.length > 0 && (
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '6px',
            color: '#856404'
          }}>
            <strong>Warnings:</strong> {data.warnings.length} warning(s) found
          </div>
        )}
      </div>

      {/* Invalid Rows */}
      {data.invalidRows.length > 0 && (
        <div>
          <h4 style={{
            margin: '0 0 1rem 0',
            fontSize: '1.1rem',
            fontWeight: '600',
            color: '#dc3545'
          }}>
            Invalid Rows ({data.invalidRows.length})
          </h4>
          
          <div style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            {data.invalidRows.map((invalidRow, index) => (
              <div
                key={index}
                style={{
                  borderBottom: index < data.invalidRows.length - 1 ? '1px solid #dee2e6' : 'none',
                  padding: '1rem'
                }}
              >
                <div style={{
                  fontWeight: '600',
                  color: '#dc3545',
                  marginBottom: '0.5rem'
                }}>
                  Row {invalidRow.row}
                </div>
                
                <div style={{
                  fontSize: '0.9rem',
                  color: '#666',
                  marginBottom: '0.5rem'
                }}>
                  Data: {Object.entries(invalidRow.data)
                    .map(([key, value]) => `${key}: "${value}"`)
                    .join(', ')}
                </div>
                
                <div style={{
                  fontSize: '0.9rem'
                }}>
                  {invalidRow.errors.map((error, errorIndex) => (
                    <div
                      key={errorIndex}
                      style={{
                        color: '#dc3545',
                        marginBottom: '0.25rem'
                      }}
                    >
                      • {error.message}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Valid Rows Preview */}
      {data.validRows.length > 0 && (
        <div>
          <h4 style={{
            margin: '0 0 1rem 0',
            fontSize: '1.1rem',
            fontWeight: '600',
            color: '#333'
          }}>
            Valid Rows Preview ({data.validRows.length})
          </h4>
          
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr auto',
              gap: '1rem',
              padding: '1rem',
              backgroundColor: '#f8f9fa',
              borderBottom: '1px solid #dee2e6',
              fontWeight: '600',
              fontSize: '0.9rem',
              color: '#495057'
            }}>
              <div>First Name</div>
              <div>Last Name</div>
              <div>Student ID</div>
              <div>Row</div>
            </div>
            
            {/* Rows */}
            <div style={{
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              {data.validRows.slice(0, 10).map((row, index) => (
                <div
                  key={index}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr auto',
                    gap: '1rem',
                    padding: '0.75rem 1rem',
                    borderBottom: index < Math.min(data.validRows.length, 10) - 1 ? '1px solid #f1f3f4' : 'none',
                    fontSize: '0.9rem'
                  }}
                >
                  <div>{row.firstName}</div>
                  <div>{row.lastName}</div>
                  <div style={{ color: row.studentId ? '#333' : '#999' }}>
                    {row.studentId || 'None'}
                  </div>
                  <div style={{ color: '#666', fontSize: '0.8rem' }}>
                    #{row.rowIndex}
                  </div>
                </div>
              ))}
              
              {data.validRows.length > 10 && (
                <div style={{
                  padding: '1rem',
                  textAlign: 'center',
                  color: '#666',
                  fontSize: '0.9rem',
                  backgroundColor: '#f8f9fa',
                  fontStyle: 'italic'
                }}>
                  ... and {data.validRows.length - 10} more rows
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '1rem',
        borderTop: '1px solid #dee2e6'
      }}>
        <div>
          {data.invalidRows.length > 0 && (
            <div style={{
              fontSize: '0.9rem',
              color: '#dc3545'
            }}>
              {data.invalidRows.length} row(s) will be skipped
            </div>
          )}
        </div>
        
        <div style={{
          display: 'flex',
          gap: '0.75rem'
        }}>
          {onBack && (
            <button
              onClick={onBack}
              disabled={isLoading}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#5a6268'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#6c757d'
              }}
            >
              Back
            </button>
          )}
          
          {onConfirm && data.validRows.length > 0 && (
            <button
              onClick={onConfirm}
              disabled={isLoading}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: isLoading ? '#ccc' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#218838'
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#28a745'
                }
              }}
            >
              {isLoading ? 'Importing...' : `Import ${data.validRows.length} Students`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}