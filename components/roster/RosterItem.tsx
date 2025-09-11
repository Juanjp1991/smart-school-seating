'use client'

import { useState } from 'react'
import { Roster } from '@/lib/db'

interface RosterItemProps {
  roster: Roster
  isSelected: boolean
  onClick: () => void
  onEdit: () => void
  onDelete: () => void
}

export default function RosterItem({
  roster,
  isSelected,
  onClick,
  onEdit,
  onDelete
}: RosterItemProps) {
  const [showMenu, setShowMenu] = useState(false)

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowMenu(!showMenu)
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowMenu(false)
    onEdit()
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowMenu(false)
    onDelete()
  }

  return (
    <div
      onClick={onClick}
      className={`
        p-3 mx-2 rounded-md cursor-pointer relative transition-all duration-200
        ${isSelected 
          ? 'bg-blue-50 border border-blue-300 text-blue-800' 
          : 'border border-transparent hover:bg-gray-50'
        }
      `}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <h3 className={`
            text-sm font-semibold mb-1 truncate
            ${isSelected ? 'text-blue-800' : 'text-gray-900'}
          `}>
            {roster.name}
          </h3>
          <p className="text-xs text-gray-600 truncate">
            Created {formatDate(roster.created_at)}
          </p>
        </div>

        {/* Menu Button */}
        <div className="relative">
          <button
            onClick={handleMenuClick}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 transition-colors text-gray-500 hover:text-gray-700"
            title="More options"
            aria-label="More options"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <>
              {/* Backdrop to close menu */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />
              
              {/* Menu */}
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[120px] overflow-hidden">
                <button
                  onClick={handleEdit}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}