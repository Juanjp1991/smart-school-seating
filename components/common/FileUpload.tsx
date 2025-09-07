'use client'

import { useState, useRef } from 'react'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  accept?: string
  maxSize?: number // in MB
  disabled?: boolean
  className?: string
}

export default function FileUpload({
  onFileSelect,
  accept = '.csv,.txt',
  maxSize = 10,
  disabled = false,
  className = ''
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (disabled) return

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const handleFile = (file: File) => {
    setError(null)

    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    const allowedExtensions = accept.split(',').map(ext => ext.trim().replace('.', ''))
    
    if (!allowedExtensions.includes(fileExtension || '')) {
      setError(`Please select a valid file type: ${accept}`)
      return
    }

    // Check file size
    const maxSizeBytes = maxSize * 1024 * 1024
    if (file.size > maxSizeBytes) {
      setError(`File size must be less than ${maxSize}MB`)
      return
    }

    onFileSelect(file)
  }

  const openFileDialog = () => {
    if (fileInputRef.current && !disabled) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className={className}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        accept={accept}
        style={{ display: 'none' }}
        disabled={disabled}
      />
      
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
        style={{
          border: `2px dashed ${dragActive ? '#007bff' : error ? '#dc3545' : '#dee2e6'}`,
          borderRadius: '8px',
          padding: '2rem',
          textAlign: 'center' as const,
          cursor: disabled ? 'not-allowed' : 'pointer',
          backgroundColor: dragActive ? '#f8f9ff' : disabled ? '#f8f9fa' : 'white',
          transition: 'all 0.2s ease',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          if (!disabled && !dragActive) {
            e.currentTarget.style.borderColor = '#007bff'
            e.currentTarget.style.backgroundColor = '#f8f9ff'
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && !dragActive) {
            e.currentTarget.style.borderColor = '#dee2e6'
            e.currentTarget.style.backgroundColor = 'white'
          }
        }}
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            fontSize: '3rem',
            opacity: disabled ? 0.5 : 0.7
          }}>
            📁
          </div>
          
          <div>
            <h3 style={{
              margin: '0 0 0.5rem 0',
              fontSize: '1.1rem',
              fontWeight: '600',
              color: disabled ? '#6c757d' : '#333'
            }}>
              {dragActive ? 'Drop your CSV file here' : 'Upload CSV File'}
            </h3>
            <p style={{
              margin: 0,
              fontSize: '0.9rem',
              color: disabled ? '#6c757d' : '#666'
            }}>
              Drag and drop your file here, or click to browse
            </p>
          </div>
          
          <div style={{
            fontSize: '0.8rem',
            color: '#999',
            backgroundColor: '#f8f9fa',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            border: '1px solid #e9ecef'
          }}>
            Supported formats: {accept.toUpperCase()}<br/>
            Maximum size: {maxSize}MB
          </div>
        </div>
        
        {error && (
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            backgroundColor: 'rgba(220, 53, 69, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#dc3545',
            fontWeight: '500',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}
      </div>
    </div>
  )
}