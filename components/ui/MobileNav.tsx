import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from './Button'

export interface MobileNavProps {
  currentPath?: string
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentPath }) => {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/layout-editor', label: 'Layouts', icon: '🏫' },
    { href: '/rosters', label: 'Rosters', icon: '👥' },
    { href: '/plan-editor', label: 'Plans', icon: '📋' },
  ]

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="text-lg font-bold text-gray-900">
            SmartSchool
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Toggle navigation"
          >
            {isOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isOpen && (
          <div className="border-t border-gray-200 bg-white">
            <nav className="px-4 py-2 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center px-3 py-3 rounded-md text-sm font-medium transition-colors
                    ${currentPath === item.href
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Desktop Breadcrumb */}
      <div className="hidden lg:block bg-gray-50 border-b border-gray-200 py-2">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center space-x-2 text-sm">
            {navItems.map((item, index) => (
              <React.Fragment key={item.href}>
                {index > 0 && (
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                )}
                <Link
                  href={item.href}
                  className={`
                    px-2 py-1 rounded-md transition-colors
                    ${currentPath === item.href
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-600 hover:text-gray-900'
                    }
                  `}
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.label}
                </Link>
              </React.Fragment>
            ))}
          </nav>
        </div>
      </div>

      {/* Overlay for mobile menu */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-25 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}

export default MobileNav