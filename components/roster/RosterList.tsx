'use client'

import { Roster } from '@/lib/db'
import RosterItem from './RosterItem'

interface RosterListProps {
  rosters: Roster[]
  selectedRosterId: string | null
  isLoading: boolean
  onSelectRoster: (rosterId: string) => void
  onCreateRoster: () => void
  onEditRoster: (roster: Roster) => void
  onDeleteRoster: (roster: Roster) => void
}

export default function RosterList({
  rosters,
  selectedRosterId,
  isLoading,
  onSelectRoster,
  onCreateRoster,
  onEditRoster,
  onDeleteRoster
}: RosterListProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ 
        padding: '1rem', 
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: '#f8f9fa'
      }}>
        <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: '600' }}>
          My Rosters
        </h2>
        <button
          onClick={onCreateRoster}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '0.5rem 1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.9rem',
            fontWeight: '500',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = '#0056b3'
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = '#007bff'
            }
          }}
        >
          + New Roster
        </button>
      </div>

      {/* Roster List */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto',
        padding: '0.5rem 0'
      }}>
        {isLoading ? (
          <div style={{ 
            padding: '2rem 1rem', 
            textAlign: 'center',
            color: '#666'
          }}>
            Loading rosters...
          </div>
        ) : rosters.length === 0 ? (
          <div style={{ 
            padding: '2rem 1rem', 
            textAlign: 'center',
            color: '#666'
          }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: '500' }}>
              No rosters yet
            </p>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              Create your first roster to get started
            </p>
          </div>
        ) : (
          rosters.map((roster) => (
            <RosterItem
              key={roster.id}
              roster={roster}
              isSelected={selectedRosterId === roster.id}
              onClick={() => onSelectRoster(roster.id)}
              onEdit={() => onEditRoster(roster)}
              onDelete={() => onDeleteRoster(roster)}
            />
          ))
        )}
      </div>
    </div>
  )
}