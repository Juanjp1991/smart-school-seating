'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function Home() {
  const { isAuthenticated, userEmail, logout, isLoading } = useAuth()

  if (isLoading) {
    return (
      <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Loading...</p>
        </div>
      </main>
    )
  }

  if (!isAuthenticated) {
    return null // AuthProvider will redirect to login
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem' 
      }}>
        <div>
          <h1 style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>SmartSchool Seating</h1>
          <p style={{ color: '#666' }}>
            Welcome back, {userEmail}
          </p>
        </div>
        <button 
          onClick={logout}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}
        >
          Logout
        </button>
      </div>
      <p style={{ marginBottom: '2rem', color: '#666' }}>
        Intelligent classroom seating arrangement tool for teachers
      </p>
      
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Link 
          href="/layout-editor" 
          style={{
            padding: '1rem 2rem',
            backgroundColor: '#0070f3',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            display: 'inline-block'
          }}
        >
          Create Classroom Layout
        </Link>
        <Link 
          href="/rosters" 
          style={{
            padding: '1rem 2rem',
            backgroundColor: '#666',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            display: 'inline-block'
          }}
        >
          Manage Rosters
        </Link>
        <Link 
          href="/plan-editor" 
          style={{
            padding: '1rem 2rem',
            backgroundColor: '#28a745',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            display: 'inline-block'
          }}
        >
          Create Seating Plan
        </Link>
      </div>
    </main>
  )
}