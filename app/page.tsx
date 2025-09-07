import Link from 'next/link'

export default function Home() {
  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem' }}>SmartSchool Seating</h1>
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