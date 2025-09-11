'use client'

import { Roster } from '@/lib/db'
import RosterItem from './RosterItem'
import { Button, Card, LoadingSpinner, NoRostersEmptyState, Alert } from '@/components/ui'

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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          My Rosters
        </h2>
        <Button
          onClick={onCreateRoster}
          disabled={isLoading}
          variant="primary"
          size="sm"
          className="w-full"
          isLoading={isLoading}
        >
          + New Roster
        </Button>
      </div>

      {/* Roster List */}
      <div className="flex-1 overflow-y-auto py-2">
        {isLoading ? (
          <div className="p-8 text-center text-gray-600">
            <LoadingSpinner size="md" className="mx-auto mb-4" />
            Loading rosters...
          </div>
        ) : rosters.length === 0 ? (
          <div className="m-4">
            <NoRostersEmptyState onCreateRoster={onCreateRoster} />
            <Alert variant="info" className="mt-4">
              💡 Click the &quot;+ New Roster&quot; button above to begin
            </Alert>
          </div>
        ) : (
          <div className="space-y-1">
            {rosters.map((roster) => (
              <RosterItem
                key={roster.id}
                roster={roster}
                isSelected={selectedRosterId === roster.id}
                onClick={() => onSelectRoster(roster.id)}
                onEdit={() => onEditRoster(roster)}
                onDelete={() => onDeleteRoster(roster)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}